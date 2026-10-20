import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import type { LngLat, LngLatBounds, YMapEntity, YMapLocationRequest } from 'ymaps3';
import {
  OzonPvzCluster,
  OzonPvzMapItem,
  OzonPvzPoint,
  UserService,
} from '../../../services/user.service';

/**
 * Тип глобального объекта JS API 3.0 (подключается динамически,
 * поэтому берём типы из @yandex/ymaps3-types через alias `ymaps3`).
 */
type Ymaps3Api = typeof import('ymaps3');
type YMapInstance = InstanceType<Ymaps3Api['YMap']>;
type YMapMarkerInstance = InstanceType<Ymaps3Api['YMapMarker']>;

interface GeocodeResult {
  center: LngLat;
  bounds?: LngLatBounds;
}

/**
 * Результат поиска адреса: отображаемое название, уточнение и координаты.
 */
interface GeocodeSearchResult extends GeocodeResult {
  title: string;
  subtitle: string;
}

/**
 * Видимая область карты в формате запроса списка ПВЗ:
 * левый нижний и правый верхний углы + текущий зум.
 */
interface PvzViewport {
  viewport: {
    left_bottom: { lat: number; long: number };
    right_top: { lat: number; long: number };
  };
  zoom: number;
}

/**
 * Пакет UI-темы (`@yandex/ymaps3-default-ui-theme`) подключается динамически
 * через `ymaps3.import`, поэтому типов для него в проекте нет — описываем
 * только используемую часть.
 */
interface YMapZoomControlConstructor {
  new (props?: { duration?: number }): YMapEntity<unknown>;
}

interface YandexMapsDefaultUiTheme {
  YMapZoomControl: YMapZoomControlConstructor;
}

/** Feature ПВЗ в формате, который ожидает YMapClusterer. */
interface PvzClustererFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: LngLat;
  };
  properties: {
    item: OzonPvzMapItem;
  };
}

interface YMapClustererProps {
  method: unknown;
  features: PvzClustererFeature[];
  marker: (feature: PvzClustererFeature) => YMapEntity<unknown>;
  cluster: (coordinates: LngLat, features: PvzClustererFeature[]) => YMapEntity<unknown>;
  maxZoom?: number;
  tickTimeout?: number;
}

interface YandexMapsClusterer {
  YMapClusterer: new (props: YMapClustererProps) => YMapEntity<unknown>;
  clusterByGrid: (props: { gridSize: number }) => unknown;
}

const YANDEX_MAPS_URL = 'https://api-maps.yandex.ru/v3/';
const YANDEX_GEOCODER_URL = 'https://geocode-maps.yandex.ru/1.x/';
/** Пакет со стандартными контролами Яндекс.Карт 3.0. */
const YANDEX_MAPS_UI_THEME_PACKAGE = '@yandex/ymaps3-default-ui-theme';
/** Его нет в загрузчике по умолчанию, поэтому подключаем через jsDelivr. */
const YANDEX_MAPS_UI_THEME_CDN = 'https://cdn.jsdelivr.net/npm/{package}';
const YANDEX_MAPS_UI_THEME_CDN_PACKAGE = '@yandex/ymaps3-default-ui-theme@0.0';
/**
 * Пакет кластеризации Яндекс.Карт 3.0. В стандартном загрузчике
 * `ymaps3.import` его нет, поэтому подключаем UMD-сборку напрямую.
 */
const YANDEX_MAPS_CLUSTERER_UMD_URL =
  'https://cdn.jsdelivr.net/npm/@yandex/ymaps3-clusterer@0.0/dist/index.umd.js';
/** Имя глобальной переменной, которую создаёт UMD-сборка кластеризатора. */
const YANDEX_MAPS_CLUSTERER_GLOBAL = '@yandex/ymaps3-clusterer';
/** Размер ячейки кластеризации в пикселях экрана. */
const PVZ_CLUSTER_GRID_SIZE = 64;
/** Начиная с этого зума кластеризация отключается — показываем точки как есть. */
const PVZ_CLUSTER_MAX_ZOOM = 17;

/** Основной (синий) цвет маркеров ПВЗ. */
const PVZ_MARKER_COLOR = '#0057FF';
/** Синий цвет выбранного маркера ПВЗ. */
const PVZ_MARKER_SELECTED_COLOR = '#00209F';
/** Синий цвет маркеров кластеров. */
const PVZ_CLUSTER_COLOR = 'rgba(0, 87, 255, 0.92)';

/** Минимальная длина поискового запроса, с которой отправляем геокодер. */
const SEARCH_MIN_LENGTH = 3;
/** Задержка перед запросом, чтобы не дёргать геокодер на каждый символ. */
const SEARCH_DEBOUNCE_MS = 450;
/** Сколько вариантов адреса запрашивать у геокодера. */
const SEARCH_RESULTS_LIMIT = 7;
/**
 * Задержка перед перезапросом ПВЗ после изменения карты:
 * гасит промежуточные кадры анимации/панорамирования.
 */
const PVZ_RELOAD_DEBOUNCE_MS = 300;
/** Сколько ждём загрузку JS API, прежде чем показать ошибку с origin. */
const MAP_INIT_TIMEOUT_MS = 15000;

/**
 * Приблизительные границы России, используются, когда адрес
 * пользователя не задан или не геокодируется.
 */
const RUSSIA_BOUNDS: LngLatBounds = [
  [19.0, 41.0],
  [180.0, 82.0],
];
const DEFAULT_CENTER: LngLat = [105.3188, 61.524];
const DEFAULT_ZOOM = 7;
const ADDRESS_ZOOM = 15;
const MAX_ADDRESS_ZOOM = 16;

@Component({
  selector: 'app-select-pvz-ozon',
  templateUrl: './select-pvz-ozon.page.html',
  styleUrls: ['./select-pvz-ozon.page.scss'],
})
export class SelectPvzOzonPage implements OnInit, AfterViewInit, OnDestroy {
  /** Клик по маркеру ПВЗ: передаёт ID пункта выдачи. */
  @Output() pvzClicked = new EventEmitter<number>();

  @ViewChild('mapContainer', { static: false })
  mapContainer?: ElementRef<HTMLDivElement>;

  profile: any = {};
  map_ready: boolean = false;
  map_error: string = '';

  /** Текст в строке поиска на карте. */
  search_query: string = '';
  /** Идёт запрос к геокодеру. */
  search_loading: boolean = false;
  /** Сообщение об ошибке/отсутствии результатов поиска. */
  search_error: string = '';
  /** Найденные варианты адреса. */
  search_results: GeocodeSearchResult[] = [];

  /** Идёт запрос списка ПВЗ для текущего вьюпорта. */
  pvz_loading: boolean = false;
  /** Ошибка загрузки списка ПВЗ. */
  pvz_error: string = '';
  /** Идёт сохранение выбранного ПВЗ (блокирует кнопку «Установить»). */
  pvz_saving: boolean = false;
  /** ПВЗ, выбранный нажатием на маркер. */
  selected_pvz: OzonPvzPoint | null = null;

  private map?: YMapInstance;
  private marker?: YMapMarkerInstance;
  private ymaps3?: Ymaps3Api;
  private ymaps3Loader?: Promise<Ymaps3Api>;
  private profileLoaded = false;
  private viewReady = false;
  private mapInitialized = false;
  private initTimeout?: number;
  private searchTimer?: number;
  private pvzListTimer?: number;
  private searchRequestId = 0;
  /** Идентификатор последнего запроса ПВЗ: устаревшие ответы игнорируются. */
  private pvzRequestId = 0;
  /** Последний ответ сервера: точки и кластеры. */
  private pvzItems: OzonPvzMapItem[] = [];
  /** Маркеры, добавленные на карту (fallback без кластеризатора). */
  private pvzMarkers: YMapMarkerInstance[] = [];
  /** Кластеризатор Яндекса, если пакет загрузился. */
  private clusterer?: YMapEntity<unknown>;
  /** Промис загрузки пакета кластеризации: грузим один раз за страницу. */
  private clustererLoader?: Promise<YandexMapsClusterer>;
  /** Счётчик перерисовок: устаревшие асинхронные рендеры игнорируются. */
  private renderGeneration = 0;
  /** Результат поиска, выбранный до готовности карты. */
  private pendingResult?: GeocodeResult;
  /** Пользователь уже выбрал точку — не перебиваем её адресом из профиля. */
  private userSelectedResult = false;
  /** CDN для пакета UI-темы регистрируется один раз на всё приложение. */
  private static uiThemeCdnRegistered = false;

  constructor(
    private userService: UserService,
    private zone: NgZone,
    private toastController: ToastController,
    private nav: NavController
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryInitMap();
  }

  ngOnDestroy(): void {
    this.cancelPendingSearch();
    this.cancelScheduledPvzList();
    this.clearInitTimeout();
    this.clearPvzMarkers();
    if (this.map) {
      this.map.destroy();
      this.map = undefined;
    }
  }

  /**
   * Загружает профиль, а уже после этого инициализирует карту,
   * чтобы центрировать её по profile.ADDRESS_VALUE.
   */
  loadProfile(): void {
    this.userService
      .getProfile()
      .then((res: any) => {
        this.profile = res?.user ?? {};
        this.profileLoaded = true;
        this.afterProfileLoaded();
      })
      .catch(() => {
        this.profile = {};
        this.profileLoaded = true;
        this.afterProfileLoaded();
      });
  }

  private afterProfileLoaded(): void {
    if (!this.viewReady) {
      return;
    }
    if (!this.mapInitialized) {
      this.tryInitMap();
      return;
    }
    if (this.userSelectedResult) {
      return;
    }
    void this.centerOnProfileAddress();
  }

  private tryInitMap(): void {
    if (this.mapInitialized || !this.viewReady || !this.profileLoaded || !this.mapContainer) {
      return;
    }

    const origin = this.getLocationOrigin();

    // Яндекс проверяет HTTP Referer: для схемы capacitor://localhost ключ
    // отклоняется (403), поэтому сразу показываем причину, а не ждём таймаут.
    if (window.location.protocol === 'capacitor:') {
      this.map_error =
        `Приложение работает с origin ${origin}. Для Яндекс.Карт нужен https-origin: ` +
        'задайте iosScheme: "https" в capacitor.config.ts, выполните npx cap sync ios и пересоберите приложение.';
      return;
    }

    this.mapInitialized = true;
    this.initTimeout = window.setTimeout(() => {
      this.initTimeout = undefined;
      if (this.map_ready) {
        return;
      }
      this.zone.run(() => {
        this.map_error =
          `Яндекс.Карты не загрузились (origin: ${origin}). ` +
          'Проверьте ключ API и ограничение по HTTP Referer.';
      });
    }, MAP_INIT_TIMEOUT_MS);

    this.loadYmaps()
      .then(async (api: Ymaps3Api) => {
        this.ymaps3 = api;
        await api.ready;
        this.createMap(api);
      })
      .catch((error: unknown) => {
        this.mapInitialized = false;
        this.clearInitTimeout();
        this.zone.run(() => {
          this.map_error =
            `Не удалось загрузить Яндекс.Карты (origin: ${origin}). ` +
            'Проверьте ключ API и ограничение по HTTP Referer.';
        });
        console.error('Yandex Maps load error', error);
      });
  }

  private createMap(api: Ymaps3Api): void {
    const container = this.mapContainer?.nativeElement;
    if (!container) {
      return;
    }

    const location: YMapLocationRequest = { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
    const map = new api.YMap(container, { location });
    map.addChild(new api.YMapDefaultSchemeLayer({}));
    map.addChild(new api.YMapDefaultFeaturesLayer({}));

    // Любое изменение видимой области (панорамирование, масштаб,
    // поиск, программное позиционирование) перезапрашивает список ПВЗ.
    map.addChild(
      new api.YMapListener({
        onUpdate: () => this.scheduleLoadPvzList(),
        onActionEnd: () => this.scheduleLoadPvzList(),
        onResize: () => this.scheduleLoadPvzList(),
      })
    );

    this.map = map;
    this.clearInitTimeout();

    this.zone.run(() => {
      this.map_ready = true;
    });

    // Пакет UI-темы грузится отдельно, поэтому не ждём его для показа карты.
    void this.addZoomControl(api, map);

    const pending = this.pendingResult;
    if (pending) {
      this.pendingResult = undefined;
      this.moveMapTo(pending);
      return;
    }

    // Позиционирование асинхронное (геокодер): список ПВЗ запросится
    // после фактического смещения карты (moveMapTo/showCountry).
    void this.centerOnProfileAddress();
  }

  /**
   * Добавляет справа стандартный контрол зума (+ / −)
   * из пакета UI-темы. Если пакет не загрузился, карта продолжает работать.
   */
  private async addZoomControl(api: Ymaps3Api, map: YMapInstance): Promise<void> {
    try {
      this.registerUiThemeCdn(api);

      const importModule = api.import as unknown as (
        pkg: string
      ) => Promise<YandexMapsDefaultUiTheme>;
      const { YMapZoomControl } = await importModule(YANDEX_MAPS_UI_THEME_PACKAGE);

      // Пока грузился пакет, карту могли уничтожить (уход со страницы).
      if (this.map !== map) {
        return;
      }

      map.addChild(
        new api.YMapControls({ position: 'right' }).addChild(new YMapZoomControl({}))
      );
    } catch (error) {
      console.error('Yandex Maps zoom control load error', error);
    }
  }

  /**
   * Регистрирует CDN для пакета UI-темы: в стандартном загрузчике JS API 3.0
   * его нет, без этого `ymaps3.import` падает с ошибкой «no loader for pkg».
   */
  private registerUiThemeCdn(api: Ymaps3Api): void {
    if (SelectPvzOzonPage.uiThemeCdnRegistered) {
      return;
    }

    api.import.registerCdn(YANDEX_MAPS_UI_THEME_CDN, YANDEX_MAPS_UI_THEME_CDN_PACKAGE);
    SelectPvzOzonPage.uiThemeCdnRegistered = true;
  }

  /**
   * Центрирует карту по адресу из профиля.
   * Если адрес пустой/отсутствует или не геокодируется — показывает всю Россию.
   */
  private async centerOnProfileAddress(): Promise<void> {
    const api = this.ymaps3;
    if (!api || !this.map) {
      return;
    }

    const address = this.getProfileAddress();
    if (!address) {
      this.showCountry();
      return;
    }

    try {
      const result = await this.geocodeAddress(address);
      if (!result) {
        this.showCountry();
        return;
      }

      this.moveMapTo(result);
      const map = this.map;
      if (result.bounds && map && map.zoom > MAX_ADDRESS_ZOOM) {
        map.setLocation({ zoom: MAX_ADDRESS_ZOOM });
      }
    } catch {
      this.showCountry();
    }
  }

  /**
   * Ставит маркер в найденную точку и перемещает карту на неё
   * (по границам объекта, если они есть, иначе по центру).
   */
  private moveMapTo(result: GeocodeResult): void {
    const api = this.ymaps3;
    const map = this.map;
    if (!api || !map) {
      // Карта ещё не создана — применим точку сразу после инициализации.
      this.pendingResult = result;
      return;
    }

    if (this.marker) {
      map.removeChild(this.marker);
      this.marker = undefined;
    }

    const marker = new api.YMapMarker(
      { coordinates: result.center },
      this.createMarkerElement()
    );
    map.addChild(marker);
    this.marker = marker;

    if (result.bounds) {
      map.setLocation({ bounds: result.bounds });
    } else {
      map.setLocation({ center: result.center, zoom: ADDRESS_ZOOM });
    }

    this.scheduleLoadPvzList();
  }

  /**
   * Обработчик ввода в строке поиска: дебаунс + запрос к геокодеру.
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.search_query = target?.value ?? '';
    this.search_error = '';
    this.cancelPendingSearch();

    const query = this.search_query.trim();
    if (query.length < SEARCH_MIN_LENGTH) {
      this.search_results = [];
      this.search_loading = false;
      return;
    }

    this.searchTimer = window.setTimeout(() => {
      this.searchTimer = undefined;
      void this.runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
  }

  /**
   * Отправка запроса по кнопке «Поиск» или Enter.
   */
  async onSearchSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.cancelPendingSearch();

    const query = this.search_query.trim();
    if (query.length === 0) {
      return;
    }

    if (this.search_results.length > 0) {
      this.selectSearchResult(this.search_results[0]);
      return;
    }

    await this.runSearch(query);
    if (this.search_results.length > 0) {
      this.selectSearchResult(this.search_results[0]);
    }
  }

  /**
   * Выбор варианта из списка результатов.
   */
  selectSearchResult(result: GeocodeSearchResult): void {
    this.userSelectedResult = true;
    this.search_query = result.title;
    this.search_results = [];
    this.search_error = '';
    this.moveMapTo(result);
  }

  /**
   * Сбрасывает поиск и возвращает карту к адресу из профиля.
   */
  clearSearch(): void {
    this.cancelPendingSearch();
    this.userSelectedResult = false;
    this.pendingResult = undefined;
    this.search_query = '';
    this.search_results = [];
    this.search_loading = false;
    this.search_error = '';
    void this.centerOnProfileAddress();
  }

  private cancelPendingSearch(): void {
    if (this.searchTimer !== undefined) {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = undefined;
    }
  }

  private async runSearch(query: string): Promise<void> {
    const requestId = ++this.searchRequestId;
    this.search_loading = true;
    this.search_error = '';

    try {
      const results = await this.geocodeAddressList(query, SEARCH_RESULTS_LIMIT);
      if (requestId !== this.searchRequestId) {
        return;
      }
      this.zone.run(() => {
        this.search_loading = false;
        this.search_results = results;
        this.search_error = results.length === 0 ? 'Ничего не найдено. Уточните запрос.' : '';
      });
    } catch (error) {
      if (requestId !== this.searchRequestId) {
        return;
      }
      console.error('Yandex Geocoder search error', error);
      this.zone.run(() => {
        this.search_loading = false;
        this.search_results = [];
        this.search_error = 'Не удалось выполнить поиск. Попробуйте ещё раз.';
      });
    }
  }

  private showCountry(): void {
    this.map?.setLocation({ bounds: RUSSIA_BOUNDS });
    this.scheduleLoadPvzList();
  }

  /**
   * Геокодер не входит в JS API 3.0, поэтому адрес уточняется
   * через HTTP Geocoder API с тем же ключом.
   */
  private async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    const apiKey = this.getGeocoderKey();
    if (!apiKey) {
      return null;
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      geocode: address,
      format: 'json',
      results: '1',
      lang: 'ru_RU',
    });

    // Ключ геокодера ограничен по HTTP Referer, поэтому явно отправляем origin
    // страницы: https://localhost (Android), capacitor://localhost (iOS).
    const response = await fetch(`${YANDEX_GEOCODER_URL}?${params.toString()}`, {
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();
    const members = data?.response?.GeoObjectCollection?.featureMember;
    if (!Array.isArray(members) || members.length === 0) {
      return null;
    }

    const geoObject = members[0]?.GeoObject;
    const center = this.parseLngLat(geoObject?.Point?.pos);
    if (!center) {
      return null;
    }

    const result: GeocodeResult = { center };

    const lower = this.parseLngLat(geoObject?.boundedBy?.Envelope?.lowerCorner);
    const upper = this.parseLngLat(geoObject?.boundedBy?.Envelope?.upperCorner);
    if (lower && upper) {
      result.bounds = [lower, upper];
    }

    return result;
  }

  /**
   * Возвращает список найденных объектов по строке запроса.
   * Используется строкой поиска над картой.
   */
  private async geocodeAddressList(
    address: string,
    limit: number
  ): Promise<GeocodeSearchResult[]> {
    const apiKey = this.getGeocoderKey();
    if (!apiKey) {
      return [];
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      geocode: address,
      format: 'json',
      results: String(limit),
      lang: 'ru_RU',
    });

    // Подсказываем геокодеру текущий центр карты — результаты будут ближе к экрану.
    const mapCenter = this.getMapCenter();
    if (mapCenter) {
      params.set('ll', `${mapCenter[0]},${mapCenter[1]}`);
      params.set('spn', '1,1');
    }

    const response = await fetch(`${YANDEX_GEOCODER_URL}?${params.toString()}`, {
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();
    const members = data?.response?.GeoObjectCollection?.featureMember;
    if (!Array.isArray(members)) {
      return [];
    }

    const results: GeocodeSearchResult[] = [];
    for (const member of members) {
      const result = this.toSearchResult(member?.GeoObject);
      if (result) {
        results.push(result);
      }
    }
    return results;
  }

  private toSearchResult(geoObject: any): GeocodeSearchResult | null {
    const center = this.parseLngLat(geoObject?.Point?.pos);
    if (!center) {
      return null;
    }

    const formatted: unknown =
      geoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted;
    const name: unknown = geoObject?.name;
    const description: unknown = geoObject?.description;

    const title =
      typeof name === 'string' && name.trim() !== ''
        ? name.trim()
        : typeof formatted === 'string' && formatted.trim() !== ''
          ? formatted.trim()
          : 'Найденный адрес';

    let subtitle = typeof description === 'string' ? description.trim() : '';
    if (subtitle === title) {
      subtitle = '';
    }
    if (subtitle === '' && typeof formatted === 'string' && formatted.trim() !== title) {
      subtitle = formatted.trim();
    }

    const result: GeocodeSearchResult = { title, subtitle, center };

    const lower = this.parseLngLat(geoObject?.boundedBy?.Envelope?.lowerCorner);
    const upper = this.parseLngLat(geoObject?.boundedBy?.Envelope?.upperCorner);
    if (lower && upper) {
      result.bounds = [lower, upper];
    }

    return result;
  }

  private getGeocoderKey(): string {
    return this.userService.getYandexGeocoderKey() || this.userService.getYandexMapKey();
  }

  private getMapCenter(): LngLat | null {
    const center = this.map?.center;
    if (!center) {
      return null;
    }
    return [center[0], center[1]];
  }

  /**
   * Возвращает видимую область карты в формате запроса списка ПВЗ.
   * `map.bounds` — две угловые точки видимой области в порядке `[long, lat]`.
   * Порядок углов в разных версиях API отличается, поэтому нормализуем
   * их через min/max и получаем левый нижний и правый верхний углы.
   */
  private getPvzViewport(): PvzViewport | null {
    const map = this.map;
    if (!map) {
      return null;
    }

    const bounds = map.bounds;
    if (!bounds || bounds.length < 2) {
      return null;
    }

    const [first, second] = bounds;
    const longLeft = Math.min(first[0], second[0]);
    const longRight = Math.max(first[0], second[0]);
    const latBottom = Math.min(first[1], second[1]);
    const latTop = Math.max(first[1], second[1]);

    return {
      viewport: {
        left_bottom: { lat: latBottom, long: longLeft },
        right_top: { lat: latTop, long: longRight },
      },
      // Ozon ожидает целочисленный зум, поэтому округляем float-значение карты.
      zoom: Math.round(map.zoom),
    };
  }

  /**
   * Загружает ПВЗ для текущей видимой области карты через
   * bitrix24/ozon_pvz.php: сервер читает локальную SQLite-базу и,
   * если точек много, отдаёт их кластерами.
   */
  async loadPvzList(): Promise<void> {
    const viewport = this.getPvzViewport();
    if (!viewport) {
      return;
    }

    // Карта может двигаться быстрее ответа сервера — применяем только последний запрос.
    const requestId = ++this.pvzRequestId;
    this.zone.run(() => {
      this.pvz_loading = true;
    });

    try {
      const response = await this.userService.getOzonPvzList(viewport);
      if (requestId !== this.pvzRequestId) {
        return;
      }

      this.zone.run(() => {
        this.pvz_loading = false;

        if (response?.error) {
          this.pvz_error = response.message || 'Не удалось загрузить список ПВЗ.';
          return;
        }

        this.pvz_error = '';
        this.pvzItems = Array.isArray(response?.clusters) ? response.clusters : [];
        void this.renderPvzItems();
      });
    } catch (error) {
      if (requestId !== this.pvzRequestId) {
        return;
      }
      console.error('PVZ: не удалось загрузить список ПВЗ', error);
      this.zone.run(() => {
        this.pvz_loading = false;
        this.pvz_error = 'Не удалось загрузить список ПВЗ. Попробуйте ещё раз.';
      });
    }
  }

  /**
   * Перерисовывает ПВЗ через YMapClusterer: точки и серверные кластеры
   * уходят в кластеризатор как features, а Яндекс группирует их по сетке.
   * Если пакет кластеризации не загрузился — работает ручная отрисовка.
   */
  private async renderPvzItems(): Promise<void> {
    const api = this.ymaps3;
    const map = this.map;
    if (!api || !map) {
      return;
    }

    const generation = ++this.renderGeneration;
    let clustererPackage: YandexMapsClusterer | null = null;

    try {
      clustererPackage = await this.loadClustererPackage();
    } catch (error) {
      console.error('Yandex Maps clusterer load error', error);
    }

    // Пока грузился пакет, карту или данные могли обновить.
    if (generation !== this.renderGeneration || this.map !== map) {
      return;
    }

    this.clearPvzMarkers();

    if (!clustererPackage) {
      this.renderPvzItemsLegacy(api, map);
      return;
    }

    const features = this.pvzItems.map((item, index) => this.toClustererFeature(item, index));

    const clusterer = new clustererPackage.YMapClusterer({
      method: clustererPackage.clusterByGrid({ gridSize: PVZ_CLUSTER_GRID_SIZE }),
      features,
      maxZoom: PVZ_CLUSTER_MAX_ZOOM,
      tickTimeout: 100,
      marker: (feature) => this.createPvzMarker(api, feature),
      cluster: (coordinates, clusterFeatures) =>
        this.createPvzClusterMarker(api, coordinates, clusterFeatures),
    });

    map.addChild(clusterer);
    this.clusterer = clusterer;
  }

  /**
   * Загружает пакет YMapClusterer UMD-скриптом с CDN.
   * `ymaps3.import` этот пакет не знает и падает с «no loader for pkg».
   */
  private loadClustererPackage(): Promise<YandexMapsClusterer> {
    if (this.clustererLoader) {
      return this.clustererLoader;
    }

    const globalScope = window as unknown as Record<string, YandexMapsClusterer | undefined>;
    const existing = globalScope[YANDEX_MAPS_CLUSTERER_GLOBAL];
    if (existing) {
      this.clustererLoader = Promise.resolve(existing);
      return this.clustererLoader;
    }

    this.clustererLoader = new Promise<YandexMapsClusterer>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = YANDEX_MAPS_CLUSTERER_UMD_URL;
      script.async = true;
      script.onload = () => {
        const pkg = globalScope[YANDEX_MAPS_CLUSTERER_GLOBAL];
        if (
          pkg &&
          typeof pkg.YMapClusterer === 'function' &&
          typeof pkg.clusterByGrid === 'function'
        ) {
          resolve(pkg);
        } else {
          reject(new Error('ymaps3 clusterer is not available'));
        }
      };
      script.onerror = () => {
        this.clustererLoader = undefined;
        reject(new Error('Failed to load ymaps3 clusterer script'));
      };
      document.head.appendChild(script);
    });

    return this.clustererLoader;
  }

  /** Преобразует элемент ответа сервера в feature для кластеризатора. */
  private toClustererFeature(item: OzonPvzMapItem, index: number): PvzClustererFeature {
    const id =
      item.type === 'cluster'
        ? `cluster-${index}-${item.lat}-${item.long}`
        : `point-${item.delivery_point_id}`;

    return {
      type: 'Feature',
      id,
      geometry: {
        type: 'Point',
        coordinates: [item.long, item.lat],
      },
      properties: { item },
    };
  }

  /** Маркер одиночного ПВЗ или серверного кластера. */
  private createPvzMarker(api: Ymaps3Api, feature: PvzClustererFeature): YMapEntity<unknown> {
    const item = feature.properties.item;

    if (item.type === 'cluster') {
      const element = this.createClusterElement(item.count);
      element.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        this.zoomToCluster(item);
      });
      return new api.YMapMarker({ coordinates: feature.geometry.coordinates }, element);
    }

    const isSelected =
      this.selected_pvz !== null &&
      this.selected_pvz.delivery_point_id === item.delivery_point_id;
    const element = this.createMarkerElement(isSelected);
    element.addEventListener('click', (event: Event) => {
      event.stopPropagation();
      this.selectPvz(item);
    });

    return new api.YMapMarker({ coordinates: feature.geometry.coordinates }, element);
  }

  /**
   * Маркер кластера, собранного YMapClusterer. В счётчике учитываются
   * и одиночные точки, и серверные кластеры (по их count).
   */
  private createPvzClusterMarker(
    api: Ymaps3Api,
    coordinates: LngLat,
    features: PvzClustererFeature[]
  ): YMapEntity<unknown> {
    const count = features.reduce(
      (sum, feature) =>
        sum + (feature.properties.item.type === 'cluster' ? feature.properties.item.count : 1),
      0
    );

    const element = this.createClusterElement(count);
    element.addEventListener('click', (event: Event) => {
      event.stopPropagation();
      this.zoomToClusterFeatures(features);
    });

    return new api.YMapMarker({ coordinates }, element);
  }

  /** Запасная отрисовка без YMapClusterer (если пакет не загрузился). */
  private renderPvzItemsLegacy(api: Ymaps3Api, map: YMapInstance): void {
    for (const item of this.pvzItems) {
      const coordinates: LngLat = [item.long, item.lat];
      let element: HTMLElement;

      if (item.type === 'cluster') {
        element = this.createClusterElement(item.count);
        element.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          this.zoomToCluster(item);
        });
      } else {
        const isSelected =
          this.selected_pvz !== null &&
          this.selected_pvz.delivery_point_id === item.delivery_point_id;
        element = this.createMarkerElement(isSelected);
        element.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          this.selectPvz(item);
        });
      }

      const marker = new api.YMapMarker({ coordinates }, element);
      map.addChild(marker);
      this.pvzMarkers.push(marker);
    }
  }

  /** Снимает с карты кластеризатор и все маркеры ПВЗ. */
  private clearPvzMarkers(): void {
    const map = this.map;

    if (map && this.clusterer) {
      try {
        map.removeChild(this.clusterer);
      } catch {
        // Кластеризатор уже снят вместе с картой.
      }
    }
    this.clusterer = undefined;

    if (map) {
      for (const marker of this.pvzMarkers) {
        try {
          map.removeChild(marker);
        } catch {
          // Маркер уже снят вместе с картой.
        }
      }
    }
    this.pvzMarkers = [];
  }

  /**
   * Приближает карту к границам серверного кластера — после этого
   * загрузится следующий уровень детализации.
   */
  private zoomToCluster(cluster: OzonPvzCluster): void {
    const { left_bottom, right_top } = cluster.bounds;
    this.zoomToBounds(left_bottom.long, left_bottom.lat, right_top.long, right_top.lat);
  }

  /** Приближает карту к границам клиентского кластера YMapClusterer. */
  private zoomToClusterFeatures(features: PvzClustererFeature[]): void {
    let lonLeft = Infinity;
    let lonRight = -Infinity;
    let latBottom = Infinity;
    let latTop = -Infinity;

    for (const feature of features) {
      const item = feature.properties.item;
      if (item.type === 'cluster') {
        const { left_bottom, right_top } = item.bounds;
        lonLeft = Math.min(lonLeft, left_bottom.long);
        lonRight = Math.max(lonRight, right_top.long);
        latBottom = Math.min(latBottom, left_bottom.lat);
        latTop = Math.max(latTop, right_top.lat);
      } else {
        const [long, lat] = feature.geometry.coordinates;
        lonLeft = Math.min(lonLeft, long);
        lonRight = Math.max(lonRight, long);
        latBottom = Math.min(latBottom, lat);
        latTop = Math.max(latTop, lat);
      }
    }

    if (!Number.isFinite(lonLeft) || !Number.isFinite(latBottom)) {
      return;
    }

    this.zoomToBounds(lonLeft, latBottom, lonRight, latTop);
  }

  /**
   * Перемещает карту по границам. У кластера из близких точек границы
   * могут быть нулевыми — добавляем отступ, иначе масштаб не изменится.
   */
  private zoomToBounds(
    lonLeft: number,
    latBottom: number,
    lonRight: number,
    latTop: number
  ): void {
    const map = this.map;
    if (!map) {
      return;
    }

    const minDelta = 0.001;
    if (Math.abs(lonRight - lonLeft) < minDelta) {
      lonLeft -= minDelta;
      lonRight += minDelta;
    }
    if (Math.abs(latTop - latBottom) < minDelta) {
      latBottom -= minDelta;
      latTop += minDelta;
    }

    map.setLocation({
      bounds: [
        [lonLeft, latBottom],
        [lonRight, latTop],
      ],
    });

    this.scheduleLoadPvzList();
  }

  /** Выбор ПВЗ нажатием на маркер. */
  selectPvz(point: OzonPvzPoint): void {
    // Клик приходит из внутренних обработчиков YMapClusterer —
    // возвращаем обновление состояния и эмит события в зону Angular.
    this.zone.run(() => {
      this.selected_pvz = point;
      this.pvzClicked.emit(point.delivery_point_id);
    });
    void this.renderPvzItems();
  }

  /**
   * Кнопка «Установить» в карточке ПВЗ: сохраняет выбранный пункт выдачи
   * в профиле (user.php, action=setPvzOzon) и возвращает на предыдущий экран.
   */
  async confirmSelectedPvz(): Promise<void> {
    const point = this.selected_pvz;
    if (!point || this.pvz_saving) {
      return;
    }

    // В контакт Битрикс24 пишется полный адрес пункта выдачи строкой,
    // в конец которой добавляется номер ПВЗ.
    const address = this.getPvzAddressWithNumber(point);
    if (address === '') {
      return;
    }

    this.zone.run(() => {
      this.pvz_saving = true;
    });

    try {
      await this.userService.updatePvzOzon(address);

      const toast = await this.toastController.create({
        message: 'Информация обновлена.',
        duration: 2000,
        color: 'accent',
      });
      this.nav.back();
      toast.present();
    } finally {
      this.zone.run(() => {
        this.pvz_saving = false;
      });
    }
  }

  /**
   * Полный адрес ПВЗ с номером пункта выдачи в конце.
   * Пример: «г. Москва, ул. Ленина, д. 1, № 12345».
   */
  private getPvzAddressWithNumber(point: OzonPvzPoint): string {
    const address = (point.address || point.name || '').trim();
    if (address === '') {
      return '';
    }

    const number = (point.delivery_point_number || '').trim();
    if (number === '') {
      return address;
    }

    return `${address}, № ${number}`;
  }

  /** Сброс выбранного ПВЗ. */
  clearSelectedPvz(): void {
    if (this.selected_pvz === null) {
      return;
    }
    this.zone.run(() => {
      this.selected_pvz = null;
    });
    void this.renderPvzItems();
  }

  /**
   * Планирует перезапрос ПВЗ после изменения карты.
   * Дебаунс не даёт дёргать API на каждый кадр анимации перетаскивания/зума.
   */
  private scheduleLoadPvzList(): void {
    this.cancelScheduledPvzList();
    this.pvzListTimer = window.setTimeout(() => {
      this.pvzListTimer = undefined;
      void this.loadPvzList();
    }, PVZ_RELOAD_DEBOUNCE_MS);
  }

  private cancelScheduledPvzList(): void {
    if (this.pvzListTimer !== undefined) {
      window.clearTimeout(this.pvzListTimer);
      this.pvzListTimer = undefined;
    }
  }

  private parseLngLat(value: unknown): LngLat | null {
    if (typeof value !== 'string') {
      return null;
    }

    const [lonRaw, latRaw] = value.trim().split(/\s+/);
    const lon = Number(lonRaw);
    const lat = Number(latRaw);

    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      return null;
    }

    return [lon, lat];
  }

  private clearInitTimeout(): void {
    if (this.initTimeout !== undefined) {
      window.clearTimeout(this.initTimeout);
      this.initTimeout = undefined;
    }
  }

  private getLocationOrigin(): string {
    const origin = window.location.origin;
    if (origin && origin !== 'null') {
      return origin;
    }
    return `${window.location.protocol}//${window.location.host}`;
  }

  /**
   * Маркер одиночного ПВЗ: синий круг с буквой «О».
   * Выбранный ПВЗ выделяется размером и более тёмным цветом.
   */
  private createMarkerElement(selected: boolean = false): HTMLElement {
    // Круглый маркер увеличенного размера — так его проще нажать.
    const size = selected ? 32 : 26;
    const element = document.createElement('div');
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.borderRadius = '50%';
    element.style.boxSizing = 'border-box';
    element.style.background = selected ? PVZ_MARKER_SELECTED_COLOR : PVZ_MARKER_COLOR;
    element.style.border = '3px solid #FFFFFF';
    element.style.boxShadow = '0 0 6px rgba(0, 0, 0, 0.4)';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.color = '#FFFFFF';
    element.style.font =
      '700 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    element.style.userSelect = 'none';
    element.style.cursor = 'pointer';
    element.textContent = 'О';
    return element;
  }

  /**
   * Маркер кластера: круг с количеством ПВЗ внутри.
   */
  private createClusterElement(count: number): HTMLElement {
    const size = count >= 100 ? 46 : count >= 10 ? 40 : 34;
    const element = document.createElement('div');
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.borderRadius = '50%';
    element.style.background = PVZ_CLUSTER_COLOR;
    element.style.border = '2px solid #FFFFFF';
    element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.35)';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.color = '#FFFFFF';
    element.style.font =
      '600 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    element.style.cursor = 'pointer';
    element.textContent = String(count);
    return element;
  }

  private getProfileAddress(): string {
    const address: unknown = this.profile?.ADDRESS_VALUE;
    return typeof address === 'string' ? address.trim() : '';
  }

  private loadYmaps(): Promise<Ymaps3Api> {
    const existing = (window as unknown as { ymaps3?: Ymaps3Api }).ymaps3;
    if (existing) {
      return Promise.resolve(existing);
    }
    if (this.ymaps3Loader) {
      return this.ymaps3Loader;
    }

    this.ymaps3Loader = new Promise<Ymaps3Api>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.getYmapsUrl();
      script.async = true;
      // Для ключей JS API 3.0 важен HTTP Referer — отправляем origin приложения.
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      script.onload = () => {
        const api = (window as unknown as { ymaps3?: Ymaps3Api }).ymaps3;
        if (api) {
          resolve(api);
        } else {
          reject(new Error('ymaps3 is not available'));
        }
      };
      script.onerror = () => {
        this.ymaps3Loader = undefined;
        reject(new Error('Failed to load Yandex Maps script'));
      };
      document.head.appendChild(script);
    });

    return this.ymaps3Loader;
  }

  private getYmapsUrl(): string {
    const params = new URLSearchParams({ lang: 'ru_RU' });
    // Ключ API сохраняется в localStorage при загрузке данных главной страницы
    const apiKey = this.userService.getYandexMapKey();
    if (apiKey) {
      params.set('apikey', apiKey);
    }
    return `${YANDEX_MAPS_URL}?${params.toString()}`;
  }
}

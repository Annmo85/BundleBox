import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../../services/user.service';

/**
 * JavaScript API Яндекс.Карт подключается динамически,
 * поэтому глобальный объект описываем самостоятельно.
 */
declare global {
  interface Window {
    ymaps?: any;
  }
}

const YANDEX_MAPS_URL = 'https://api-maps.yandex.ru/2.1/';

/**
 * Приблизительные границы России (без учёта Чукотки за 180-м меридианом),
 * используются, когда адрес пользователя не задан или не геокодируется.
 */
const RUSSIA_BOUNDS: [[number, number], [number, number]] = [
  [41.0, 19.0],
  [82.0, 180.0],
];
const DEFAULT_CENTER: [number, number] = [61.524, 105.3188];
const DEFAULT_ZOOM = 2;

@Component({
  selector: 'app-select-pvz-ozon',
  templateUrl: './select-pvz-ozon.page.html',
  styleUrls: ['./select-pvz-ozon.page.scss'],
})
export class SelectPvzOzonPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false })
  mapContainer?: ElementRef<HTMLDivElement>;

  profile: any = {};
  map_ready: boolean = false;
  map_error: string = '';

  private map?: any;
  private ymaps?: any;
  private ymapsLoader?: Promise<any>;
  private profileLoaded = false;
  private viewReady = false;
  private mapInitialized = false;
  private resizeTimer?: ReturnType<typeof setTimeout>;

  private readonly onWindowResize = (): void => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => this.fitMap(), 150);
  };

  constructor(private userService: UserService, private zone: NgZone) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize);
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryInitMap();
  }

  ionViewDidEnter(): void {
    // ion-content окончательно вычисляет размеры после анимации перехода.
    setTimeout(() => this.fitMap(), 150);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
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
    void this.centerOnProfileAddress();
  }

  private tryInitMap(): void {
    if (this.mapInitialized || !this.viewReady || !this.profileLoaded || !this.mapContainer) {
      return;
    }

    this.mapInitialized = true;

    this.loadYmaps()
      .then((ymaps: any) => {
        this.ymaps = ymaps;
        return ymaps.ready();
      })
      .then(() => this.createMap())
      .catch((error: unknown) => {
        this.mapInitialized = false;
        this.zone.run(() => {
          this.map_error = 'Не удалось загрузить Яндекс.Карты. Проверьте подключение к интернету.';
        });
        console.error('Yandex Maps load error', error);
      });
  }

  private createMap(): void {
    const ymaps = this.ymaps;
    const container = this.mapContainer?.nativeElement;
    if (!ymaps || !container) {
      return;
    }

    this.map = new ymaps.Map(
      container,
      {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        controls: ['zoomControl', 'geolocationControl'],
      },
      {
        suppressMapOpenBlock: true,
      }
    );

    this.zone.run(() => {
      this.map_ready = true;
    });

    void this.centerOnProfileAddress();
  }

  /**
   * Центрирует карту по адресу из профиля.
   * Если адрес пустой/отсутствует или не геокодируется — показывает всю Россию.
   */
  private async centerOnProfileAddress(): Promise<void> {
    const ymaps = this.ymaps;
    if (!ymaps || !this.map) {
      return;
    }

    const address = this.getProfileAddress();
    if (!address) {
      this.showCountry();
      return;
    }

    try {
      const result = await ymaps.geocode(address, { results: 1 });
      const geoObject = result?.geoObjects?.get(0);
      if (!geoObject) {
        this.showCountry();
        return;
      }

      const coordinates = geoObject.geometry.getCoordinates();
      this.map.geoObjects.removeAll();
      this.map.geoObjects.add(
        new ymaps.Placemark(
          coordinates,
          { hintContent: address, balloonContent: address },
          { preset: 'islands#blueDotIcon' }
        )
      );

      try {
        await this.map.setBounds(geoObject.properties.get('boundedBy') ?? [coordinates, coordinates], {
          checkZoomRange: true,
          zoomMargin: 40,
        });
        if (this.map.getZoom() > 16) {
          this.map.setZoom(16);
        }
      } catch {
        this.map.setCenter(coordinates, 15);
      }
    } catch {
      this.showCountry();
    }
  }

  private showCountry(): void {
    if (!this.map) {
      return;
    }

    this.map
      .setBounds(RUSSIA_BOUNDS, { checkZoomRange: true, zoomMargin: 0 })
      .catch(() => this.map.setCenter(DEFAULT_CENTER, DEFAULT_ZOOM));
  }

  private getProfileAddress(): string {
    const address: unknown = this.profile?.ADDRESS_VALUE;
    return typeof address === 'string' ? address.trim() : '';
  }

  private fitMap(): void {
    if (this.map?.container) {
      this.map.container.fitToViewport();
    }
  }

  private loadYmaps(): Promise<any> {
    if (window.ymaps) {
      return Promise.resolve(window.ymaps);
    }
    if (this.ymapsLoader) {
      return this.ymapsLoader;
    }

    this.ymapsLoader = new Promise<any>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.getYmapsUrl();
      script.async = true;
      script.onload = () => {
        if (window.ymaps) {
          resolve(window.ymaps);
        } else {
          reject(new Error('ymaps is not available'));
        }
      };
      script.onerror = () => {
        this.ymapsLoader = undefined;
        reject(new Error('Failed to load Yandex Maps script'));
      };
      document.head.appendChild(script);
    });

    return this.ymapsLoader;
  }

  private getYmapsUrl(): string {
    const params = ['lang=ru_RU', 'load=package.full'];
    // Ключ API сохраняется в localStorage при загрузке данных главной страницы
    const apiKey = this.userService.getYandexMapKey();
    if (apiKey) {
      params.push(`apikey=${encodeURIComponent(apiKey)}`);
    }
    return `${YANDEX_MAPS_URL}?${params.join('&')}`;
  }
}

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ошибка транзакции</title>
    <!-- Подключение Bootstrap CSS -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        }

        .circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #f44336;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .circle:after {
            content: '✖';
            color: white;
            font-size: 50px;
        }

        .message {
            margin-top: 20px;
            font-size: 18px;
            color: #333;
        }

        .close-button {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="circle"></div>
    <div class="message">
        Что-то пошло не так
    </div>

    <!-- Подключение Bootstrap JS и зависимостей -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>

# JobBoard в CV

## Короткий вариант на английском

**JobBoard — Full-stack hiring platform**

React · TypeScript · Node.js · Express · PostgreSQL · Prisma · Socket.IO

- Built candidate and employer workflows for job publishing, applications, status tracking, profiles, and application-linked real-time chat.
- Implemented role and ownership checks, OAuth, email verification, TOTP authentication, and session revocation after password resets; added frontend/API regression tests and a PostgreSQL hiring-flow test with GitHub Actions checks.
- Added server-side search and pagination, on-demand chat history, aggregate unread counts, and an employer dashboard with candidate previews; deployed the backend on Hetzner with PostgreSQL on Neon.

Ссылки: [код](https://github.com/Delax3144/jobboard), [сайт](https://www.jobboard.com.pl).
Выбери два наиболее подходящих пункта для конкретной вакансии. В CV не нужны неподтверждённые цифры пользователей, нагрузки или коммерческих результатов.

## Что показать за пять минут

1. Открыть вакансии и применить фильтр.
2. Войти кандидатом, сохранить вакансию и отправить отклик.
3. Во втором браузерном профиле войти работодателем, открыть отклик, нажать Review и Invite.
4. Обменяться сообщениями и показать обновление уведомлений.
5. Открыть схему Prisma, один тест ограничения доступа и CI.

Локальные демоданные и команды запуска описаны в основном README. Опубликованные frontend и backend обновлены; основные сценарии проверены пользователем. Перед собеседованием пройди этот сценарий ещё раз со своих аккаунтов.

## Что уметь объяснить на собеседовании

- Как запрос от кнопки проходит через API, проверку владельца и Prisma до PostgreSQL.
- Чем проверка роли отличается от проверки владельца конкретного отклика.
- Почему уникальное ограничение в БД защищает от повторного отклика надёжнее одной проверки в интерфейсе.
- Почему JWT сам по себе не отзывается при смене пароля и как помогает версия сессии.
- Почему чат хранится через REST/БД, а Socket.IO доставляет события.
- Что проверяют изолированные тесты и что дополнительно проверяет сценарий с настоящей БД.
- Как фильтры применяются до пагинации, как загружается история сообщений и зачем нужен отдельный запрос количества непрочитанных обновлений.
- Какие ограничения остались: неполные переводы, один экземпляр backend, отсутствие полной автоматизации браузерных проверок.

## Где остановиться

Проект можно использовать в CV и продолжать обучение. Следующие темы удобно осваивать отдельно: анализ планов SQL-запросов, управление серверным состоянием на frontend, тестирование браузерных сценариев и масштабирование Socket.IO. Добавлять новые функции в JobBoard ради количества не требуется.

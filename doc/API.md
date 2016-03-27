# Backend API

L'application communique avec le backend :

- http://dev-saloon.herokuapp.com pour le développement
- http://saloonapp.herokuapp.com pour la prod

L'API est située dans `/api/v1`

## Endpoints

### Events

- [GET /events/all](https://dev-saloon.herokuapp.com/api/v1/events/all) : récupérer tous les événements
- [GET /events/:eventUuid/full](https://dev-saloon.herokuapp.com/api/v1/events/bfd9b7b7-d707-45fc-85a7-4b5135f741ac/full) : récupérer les données d'un événement
- [POST /events/:eventUuid/sessions/:sessionUuid/favorites](https://dev-saloon.herokuapp.com/api/v1/events/bfd9b7b7-d707-45fc-85a7-4b5135f741ac/sessions/e713466e-100d-4f16-9eb5-8232a1e42010/favorites) : soumettre un favoris

### User

- [GET /users/:userUuid/actions/:eventUuid](https://dev-saloon.herokuapp.com/api/v1/users/26944a64-6353-44d1-8490-d5ff6de23be9/actions/bfd9b7b7-d707-45fc-85a7-4b5135f741ac) : récupérer les préférences d'un utilisateur pour un événement

# project-2-ironhack

## Endpoints:

### base.routes.js

-   / (get) (home)

### auth.routes.js

-   /signup (get, post)
-   /login (get, post)
-   /logout (get)

### user.routes.js

-   /profile (get)
-   /profile/friends (get)
-   /profile/notifications (get)
-   /profile/edit (get, post)
-   /profile/delete ? (post)
-   /profile/add-pet
-   /profile/:pet_id
-   /profile/:pet_id/edit
-   /profile/:pet_id/delete

### admin.routes.js

-   /admin
-   /admin/list-users?filters
-   /admin/:user_id/edit
-   /admin/:user_id/delete
-   /admin/:user_id/role-edit?role-query

### pets.routes.js

-   /pets
-   /pets/search?filters (admin can filter by owner user)
-   /pets/:id (get)
-   /pets/:id/contact (get, post)
-   /pets/:id/edit (get, post)(admin only, moderator for reviews)
-   /pets/:id/delete (post)(admin only)

### events.routes.js

-   /events
-   /events/search?filters
-   /events/add
-   /events/:id
-   /events/:id/edit (admin, moderator, publisher)
-   /events/:id/delete (admin, moderator, publisher)
-   /events/:id/join (owner only)(option to multipet join)
-   /events/:id/quit (owner only)(option to multipet join)

## MIDDLEWARE & HELPERS

-   validador de ObjectId
-   validador de roles
-   validador de session
-   validador de formularios

## VISTAS (nombre de archivos provisional)

-   Home: index.hbs
-   Log in page: login.hbs
-   Sign up: signup.hbs
-   Profile: profile.hbs
-   Profile edit form: profile-edit.hbs

## MODELS

-   User

    -   username: { type: String, required: true, unique: true }
    -   password: { type: String, required: true }
    -   email: { type: String }
    -   pets: { type: [ObjectId], ref: 'Pet' } (required?)
    -   role: { type: String, required: true, enum: ['OWNER', 'MODERATOR', 'ADMIN'], default: 'OWNER' }

-   Pet

    -   name: { type: String, required: true, unique: true }
    -   species: { type: String, required: true }
    -   address: { type: String, required: true }
    -   age: { type: Number, required: true }
    -   profileImage: { type: String, required: true }
    -   gender: { type: String, required: true }
    -   description: { type: String }
    -   reviews: { type: [ObjectId], ref: 'Review' }
    -   messages: { type: [ObjectId], ref: 'Message' }
    -   friends: { type: [ObjectId], ref: 'Pet' } (reiterativo == muerte?)

-   Event

    -   creator: { type: ObjectId, ref: 'Pet' }
    -   participants { type: [ObjectId], ref: 'Pet' }
    -   activity: { type: String, required: true }
    -   description: { type: String, required: true }
    -   location: { type: { type: String }, coordinates: [Number] }
    -   date: { type: Date, required: true }

-   Message

    -   origin: { type: ObjectId, ref: 'Pet' }
    -   destinatary { type: ObjectId, ref: 'Pet' }
    -   message: { type: String, required: true }
    -   date: { type: Date, required: true }

-   Review

    -   origin: { type: ObjectId, ref: 'Pet' }
    -   destinatary: { type: ObjectId, ref: 'Pet' }
    -   message: { type: String, required: true }
    -   rating: { type: Number, min: 0, max: 10, required: true }
    -   date: { type: Date, ref: 'Pet' }

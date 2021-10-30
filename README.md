# hcmus-course-backend

To run the project:

### npm start

To run in dev:

### npm run startDev

To build the project:

### npm run build

## To host a database without internet

-Type: `mongorestore backup/` to init seed data  
-Go to lib/database/index.js, uncomment the local connection string, and comment out the remote one  
-Now you can run the server without the internet ( but images will not load because it is hosting on aws cloud)

Github: https://github.com/congminh090800/hcmus-course-backend  
Hosted on: https://hcmus-course-backend.herokuapp.com

See documentation for list of apis  
Documentation: https://hcmus-course-backend.herokuapp.com/api-docs

# Note:

On documentation page,  
remember to bind access token received from `signIn` to authorize modal at the top right of the page
because most apis require authentication

Enjoy the walkthrough!!

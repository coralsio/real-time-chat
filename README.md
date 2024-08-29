# Laraship Module Setup Guide

This guide will walk you through the steps to clone and set up the Laraship & Messaging modules.

## 1. Clone the Laraship Repository

Start by cloning the Laraship repository:

```
git clone https://github.com/coralsio/laraship.git
```
Navigate to the project directory and run the following command:

```
composer install
```

## 2. Set Up Laraship

``copy .env.example .env``

``php arisan key:generate``

### Set up your own database connection in .env

```
DB_CONNECTION=
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

### Setup your own AWS Keys in .env

```
AWS_KEY=
AWS_SECRET=
AWS_REGION=
AWS_BUCKET=
```

### Run laraship deployment command

``php artisan deploy:ls``

## 3. Install the Messaging Module

Install the required messaging module via Composer:

``composer require corals/messaging``

Next, install the Messaging module from the /modules section in the admin panel.

``path-to-your-laraship.com/modules``

## 4. Install and Start Reverb

Install Reverb using the following command:

``php artisan reverb:install``

Start Reverb with:

``php artisan reverb:start``

Finally, run the messaging queue:

``php artisan queue:work --queue=messaging-queue``

## 5. Setup your Frontend

navigate your reactjs directory and run the following

``copy .env.example .env``

## 6. Update fronend .env Keys

To ensure proper configuration, you need to update the .env file with the correct values. Here's how you can map the
keys from the Laraship .env file to the frontend .env file:

### Laraship .env File

Find and update the following keys in your Laraship .env file:

```
REVERB_APP_ID=your-reverb-app-id
REVERB_APP_KEY=your-reverb-app-key
REVERB_HOST=your-reverb-host
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Frontend .env File

In your frontend .env file, update these keys accordingly:

```
NEXT_PUBLIC_REVERB_APP_ID=your-reverb-app-id
NEXT_PUBLIC_REVERB_APP_KEY=your-reverb-app-key
NEXT_PUBLIC_REVERB_HOST=your-reverb-host    
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

## 7. Configure NEXT_IMAGE_DOMAINS in .env frontend

Finally, Configure the NEXT_IMAGE_DOMAINS in your frontend .env file to specify the allowed image domains. To include
multiple domains, separate them with commas.

``your-laraship-domain,your-aws-bucket-dowmin``

``NEXT_IMAGE_DOMAINS=your-laraship-domain,your-aws-bucket-dowmin``

###You're now ready to use Laraship with the messaging module integrated!



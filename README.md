# YCSYH Beat Store

A modern e-commerce platform for selling beats with automatic file delivery, PDF license generation, and Stripe checkout integration.

## Features

- Auto file delivery (MP3/WAV/Trackouts)
- Automatic PDF license contracts
- Stripe checkout integration
- Admin dashboard to upload/edit/delete beats
- UploadThing storage for files
- Ability to mark beats as SOLD
- Home, Beat Store, About, Publishing pages
- Clean, modern, minimal UI design
- Brevo email notifications

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **UploadThing** - File storage
- **Stripe** - Payment processing
- **Brevo** - Email service
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Stripe account
- UploadThing account
- Brevo account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment variables file:

```bash
cp .env.example .env.local
```

3. Fill in your environment variables in `.env.local`:

- `MONGODB_URI` - Your MongoDB connection string
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `UPLOADTHING_SECRET` - UploadThing secret key
- `UPLOADTHING_APP_ID` - UploadThing app ID
- `BREVO_API_KEY` - Brevo API key
- `BREVO_SENDER_EMAIL` - Your sender email address
- `JWT_SECRET` - Secret key for JWT tokens (generate a random string)

4. Create your first admin user:

```bash
npm run create-admin
# Or with custom email/password:
node scripts/create-admin.js admin@ycsyh.com yourpassword "Admin Name"
```

**Note:** UploadThing handles file uploads automatically. No additional configuration needed.

5. Set up Stripe webhook (Recommended but optional):

- Go to your Stripe dashboard → Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select event: `checkout.session.completed`
- Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

**Note:** Webhooks are recommended for production but optional. Without webhooks, you'll need to manually process orders or use Stripe's redirect-based flow.

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- Upload new beats
- Edit existing beats
- Delete beats
- Mark beats as sold/available
- Upload files via UploadThing

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── beats/        # Beat CRUD operations
│   │   ├── checkout/     # Stripe checkout
│   │   ├── uploadthing/  # UploadThing file upload
│   │   └── webhooks/     # Stripe webhooks
│   ├── admin/            # Admin dashboard
│   ├── about/            # About page
│   ├── beats/            # Beat store pages
│   ├── publishing/       # Publishing page
│   └── success/          # Payment success page
├── components/           # React components
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── types/                # TypeScript types
```

## License

This project is private and proprietary.

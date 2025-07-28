# Admin Panel

A modern, responsive admin panel built with React, Vite, and Tailwind CSS. This application provides an interface for managing tasks, technicians, and other administrative functions.

## Features

- **Task Management**: Create, view, update, and delete tasks
- **Technician Assignment**: Assign multiple technicians to tasks
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a clean, professional look
- **Authentication**: Secure login system with role-based access control

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to the backend API

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```
   VITE_API_BASE_URL=your_api_base_url
   # Add other environment variables as needed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## Project Structure

```
src/
  ├── assets/          # Static assets (images, fonts, etc.)
  ├── components/      # Reusable UI components
  ├── pages/           # Page components
  ├── services/        # API services and utilities
  ├── styles/          # Global styles
  └── App.jsx          # Main application component
```

## Available Scripts

- `dev`: Start the development server
- `build`: Build the application for production
- `preview`: Preview the production build locally
- `lint`: Run ESLint
- `preview`: Preview the production build

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios for API requests
- React Icons
- Framer Motion for animations

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

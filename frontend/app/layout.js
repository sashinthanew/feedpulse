import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'FeedPulse',
  description: 'AI-Powered Product Feedback Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
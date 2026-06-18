import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <div className="relative z-10 min-h-screen">
      <Component {...pageProps} />
    </div>
  );
}

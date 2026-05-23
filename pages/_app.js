import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.cssText =
      "background:#06060f;color:#e2e0f0;font-family:'Barlow',sans-serif;min-height:100vh;overflow-x:hidden";
  }, []);

  return (
    <>
      <style global jsx>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        ::-webkit-scrollbar {
          width: 4px;
          background: #0d0d1f;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a4a;
          border-radius: 2px;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
import { GeistSans } from "geist/font/sans";

import "~/styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ConvexClientProvider } from "~/ConvexClientProvider";

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ConvexClientProvider>
      <div className={GeistSans.className}>
        {getLayout(<Component {...pageProps} />)}
      </div>
    </ConvexClientProvider>
  );
}

export default MyApp;

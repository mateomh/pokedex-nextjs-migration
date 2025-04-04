'use client'
 
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
// import Routes from '../../routes';
import rootReducer from '../../reducers/root';
import AppStyles from '../../components/styles/app.module.css';
// import PokeLogo from '../../components/pokelogo';

 
// const App = dynamic(() => import('../../App'), { ssr: false })


const PokeLogo = dynamic(() => import('../../components/pokelogo'), { ssr: false })
const Routes = dynamic(() => import('../../routes'), { ssr: false })
// const AppStyles = dynamic(() => import('../../components/styles/app.module.css'), { ssr: false })

// const store = createStore(
//   rootReducer,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
// );
 
export function ClientOnly() {
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    const devtools =
      typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : undefined;

    const createdStore = createStore(rootReducer, devtools);
    setStore(createdStore);
  }, []);

  if (!store) return null; // Or a loading spinner

  return(
    <Provider store={store}>
        <React.StrictMode>
          <div className={AppStyles.Container}>
            <PokeLogo />
            <Routes />
          </div>
        </React.StrictMode>
      </Provider>
  );
}
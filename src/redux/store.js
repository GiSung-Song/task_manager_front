import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 로컬 스토리지를 사용
import authReducer from './authSlice'; // authSlice import

// persist 설정
const persistConfig = {
    key: 'root', // 상태를 로컬 스토리지에 저장할 때의 키
    storage, // 로컬 스토리지 사용
    whitelist: ['auth'], // 'auth' 리듀서만 persist 대상
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
    reducer: {
        auth: persistedReducer, // persist된 리듀서 적용
    },
});

const persistor = persistStore(store); // persistStore 생성

export {store, persistor}; // store와 persistor 모두 export
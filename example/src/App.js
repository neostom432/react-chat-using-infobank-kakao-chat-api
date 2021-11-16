import React from 'react';

import { KakaoChat } from 'react-chat-using-infobank-kakao-chat-api';
import 'react-chat-using-infobank-kakao-chat-api/dist/index.css';

const App = () => {
  const token = localStorage.getItem('influencer-token');
  const connectHeaders = {
    Authorization: `Bearer ${token}`,
  };
  const {
    REACT_APP_CHAT_SERVER_URL,
    REACT_APP_CHAT_BRAND_ID,
    REACT_APP_CHAT_BRAND_NAME,
    REACT_APP_CHAT_USER_ID,
  } = process.env;

  let kakaoRef = React.useRef(null);

  return (
    <div className="container">
      <div className="bg">
        <button
          onClick={() => {
            const result = kakaoRef.current.openPopup('19');
            console.log(`OPEN RESULT!!!  ${result}`);
          }}
        >
          이얍!!!
        </button>
      </div>
      <KakaoChat
        connectionHeaders={connectHeaders}
        brandId={REACT_APP_CHAT_BRAND_ID}
        serverUrl={REACT_APP_CHAT_SERVER_URL}
        brandName={REACT_APP_CHAT_BRAND_NAME}
        userId={REACT_APP_CHAT_USER_ID}
        ref={kakaoRef}
      />
    </div>
  );
};

export default App;

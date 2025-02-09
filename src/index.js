import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.css';
import { Messenger } from './src/Messenger/Messenger';
import { debounce } from 'lodash';
import { ChatPopup } from './src/ChatPopup/ChatPopup';

export const KakaoChat = React.forwardRef(
  (
    { connectionHeaders, brandId, brandName, serverUrl, userId, ...props },
    ref
  ) => {
    const [connectedPopup, setConnectedPopup] = useState([]);
    const [maximumPopupCount, setMaximumPopupCount] = useState(0);
    let messengerRef = React.useRef(null);

    const debouncedSave = useRef(
      debounce((width, prevConnectedPopup) => {
        const remainSpace = width - 316;
        const expectedMaximumPopupCount = parseInt(remainSpace / 376);
        setMaximumPopupCount(expectedMaximumPopupCount);

        const newResult = prevConnectedPopup.slice(
          0,
          expectedMaximumPopupCount
        );
        setConnectedPopup(newResult);
      }, 500)
    ).current;

    const onWindowResize = () => {
      debouncedSave(window.innerWidth, connectedPopup);
    };

    useEffect(() => {
      const remainSpace = window.innerWidth - 316;
      const expectedMaximumPopupCount = parseInt(remainSpace / 376);
      setMaximumPopupCount(expectedMaximumPopupCount);

      window.addEventListener('resize', onWindowResize);
      return () => {
        window.removeEventListener('resize', onWindowResize);
      };
    }, [connectedPopup, maximumPopupCount]);

    const cx = classNames.bind(styles);
    const onChatPopupRequest = (data) => {
      if (connectedPopup.findIndex((d) => d.roomId === data.roomId) !== -1) {
        return;
      }

      if (connectedPopup.length < maximumPopupCount) {
        setConnectedPopup([...connectedPopup, data]);
      } else {
        const [first, ...remained] = connectedPopup;
        setConnectedPopup([...remained, data]);
      }
    };

    const closePopup = (data) => {
      const newResult = connectedPopup.filter((d) => d.roomId !== data.roomId);
      setConnectedPopup(newResult);
    };

    const openPopup = (roomId) => {
      return messengerRef.current.openPopup(roomId);
    };

    React.useImperativeHandle(ref, () => ({
      openPopup,
    }));

    return (
      <div className={cx('kakao-using-infobank-main')}>
        <Messenger
          onChatPopupRequest={onChatPopupRequest}
          connectionHeaders={connectionHeaders}
          brandId={brandId}
          brandName={brandName}
          serverUrl={serverUrl}
          ref={messengerRef}
        />
        {connectedPopup.map((data) => (
          <ChatPopup
            onClose={closePopup}
            data={data}
            key={data.roomId}
            connectionHeaders={connectionHeaders}
            brandId={brandId}
            brandName={brandName}
            serverUrl={serverUrl}
            userId={userId}
          />
        ))}
      </div>
    );
  }
);

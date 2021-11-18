import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import { ChatRoomListItem } from './ChatRoomListItem';
import styles from './ChatRoomList.module.css';
import { preventDoubleScroll } from '../utils/util';

export const ChatRoomList = ({
  onItemClick,
  data,
  serverUrl,
  brandId,
  connectionHeaders,
  ...props
}) => {
  const cx = classNames.bind(styles);
  const contentContainer = useRef(null);
  const menuContainer = useRef(null);

  const [showChatMenu, setShowChatMenu] = useState(false);
  const [chatMenuPosition, setChatMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedItemData, setSelectedItemData] = useState(undefined);

  useEffect(() => {
    contentContainer.current.addEventListener('mousewheel', (event) =>
      preventDoubleScroll(event, contentContainer.current)
    );
    return () => {
      contentContainer.current?.removeEventListener('mousewheel', (event) =>
        preventDoubleScroll(event, contentContainer.current)
      );
    };
  }, []);

  const onChatRoomContextMenuOpen = (e, data) => {
    // console.log('ON CHAT ROOM CONTEXT MENU OPEN ------- ');

    if (data && data.unansweredChats > 0) {
      const rect = contentContainer.current.getBoundingClientRect();
      const menuWidth = menuContainer.current.offsetWidth;
      const menuHeight = menuContainer.current.offsetHeight;

      const horizontalOutDiff = e.clientX + menuWidth - rect.right;
      const verticalOutDiff = e.clientY + menuHeight - rect.bottom;
      const candidatePosition = {
        x: e.clientX - rect.left - Math.max(horizontalOutDiff, 0),
        y: e.clientY - rect.top - Math.max(verticalOutDiff, 0),
      };

      setSelectedItemData(data);
      setChatMenuPosition(candidatePosition);
      setShowChatMenu(true);
    } else {
      setShowChatMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', (e) => setShowChatMenu(false));
    window.addEventListener('scroll', (e) => setShowChatMenu(false));
  }, []);

  const markAsRead = async (e) => {
    e.stopPropagation();

    try {
      const response = await fetch(
        serverUrl + `/${brandId}/chat_room/${selectedItemData.roomId}/read`,
        {
          method: 'POST',
          headers: connectionHeaders,
        }
      );
      const resJson = await response.json();

      const isResponseSuccess = response.status >= 200 && response.status < 400;
      if (isResponseSuccess) {
        console.log('MARK AS READ SUCCESS =====');
      } else {
        console.log(resJson);
        throw new Error(response.status);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setShowChatMenu(false);
    }
  };

  return (
    <div className={cx('container')} ref={contentContainer}>
      {data?.map((chatItemData) => (
        <ChatRoomListItem
          key={chatItemData.roomId}
          onChatRoomContextMenuOpen={onChatRoomContextMenuOpen}
          onItemClick={onItemClick}
          data={chatItemData}
        />
      ))}
      <div
        className={cx('chatMenu')}
        style={{
          left: `${chatMenuPosition.x}px`,
          top: `${chatMenuPosition.y}px`,
          visibility: showChatMenu ? 'visible' : 'hidden',
        }}
        ref={menuContainer}
      >
        <div className={cx('chatMenuItem')} onClick={markAsRead}>
          <p className={cx('chatMenuItemLabel')}>읽음으로 처리</p>
        </div>
      </div>
    </div>
  );
};

import classNames from 'classnames/bind';
import React, { useEffect, useRef } from 'react';
import { ChatRoomListItem } from './ChatRoomListItem';
import styles from './ChatRoomList.module.css';
import { preventDoubleScroll } from '../utils/util';

export const ChatRoomList = ({ onItemClick, data, ...props }) => {
  const cx = classNames.bind(styles);
  const contentContainer = useRef(null);

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

  return (
    <div className={cx('container')} ref={contentContainer}>
      {data?.map((chatItemData) => (
        <ChatRoomListItem
          key={chatItemData.roomId}
          onItemClick={onItemClick}
          data={chatItemData}
        />
      ))}
    </div>
  );
};

import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import { ChatRoomListItem } from './ChatRoomListItem';
import styles from './ChatRoomList.module.css';
import { preventDoubleScroll } from '../utils/util';

export const ChatRoomList = ({
  onItemClick,
  data,
  serverUrl,
  brandId,
  connectionHeaders,
  onChatRoomContextMenuOpen,
  onScroll,
  ...props
}) => {
  const cx = classNames.bind(styles);
  const contentContainer = useRef(null);

  useEffect(() => {
    contentContainer.current.addEventListener('mousewheel', (event) => {
      preventDoubleScroll(event, contentContainer.current);
      onScroll(event);
    });
  }, []);

  useEffect(() => {
    contentContainer.current.addEventListener('scroll', onScroll);
  }, []);

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
    </div>
  );
};

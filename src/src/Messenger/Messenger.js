import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Messenger.module.css';
import { ChatRoomList } from './ChatRoomList';
import { ReactComponent as MsgIcon } from '../../resources/images/msg-icon.svg';
import { ReactComponent as ArrowIcon } from '../../resources/images/arrow-icon.svg';
import { ReactComponent as SearchIcon } from '../../resources/images/search-icon.svg';
import SockJsClient from 'react-stomp';

export const Messenger = React.forwardRef(
  (
    {
      onChatPopupRequest,
      connectionHeaders,
      brandId,
      brandName,
      serverUrl,
      ...props
    },
    ref
  ) => {
    const cx = classNames.bind(styles);
    const [minimized, setIsMinimized] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const socketClient = useRef({});
    const [unansweredCount, setUnansweredCount] = useState(0);
    const [chatRoomList, setChatRoomList] = useState([]);
    const contentContainer = useRef(null);
    const menuContainer = useRef(null);

    const [showChatMenu, setShowChatMenu] = useState(false);
    const [chatMenuPosition, setChatMenuPosition] = useState({
      x: 0,
      y: 0,
    });
    const [selectedItemData, setSelectedItemData] = useState(undefined);

    const onMinimizeIconClicked = () => {
      const toggleValue = !minimized;
      setIsMinimized(toggleValue);
    };

    const getChatRoomList = async () => {
      try {
        const response = await fetch(serverUrl + `/${brandId}/chat_room`, {
          method: 'GET',
          headers: connectionHeaders,
        });
        const resJson = await response.json();
        const isResponseSuccess =
          response.status >= 200 && response.status < 400;
        if (isResponseSuccess) {
          // console.log(resJson);
          setChatRoomList(sortRoomList(resJson.data));
        } else {
          // console.log(resJson);
          throw new Error(response.status);
        }
      } catch (e) {
        console.log(e);
      }
    };

    const sortRoomList = (roomList) => {
      const unansweredList = roomList.filter(
        (room) => room.unansweredChats > 0
      );
      const answeredList = roomList.filter((room) => room.unansweredChats == 0);

      const sortByDate = (a, b) => {
        const aTime = new Date(a.latestChat.messageDt);
        const bTime = new Date(b.latestChat.messageDt);

        return bTime - aTime;
      };

      unansweredList.sort(sortByDate);
      answeredList.sort(sortByDate);

      const result = unansweredList.reduce((accumulator, value) => {
        const isValid =
          value.latestChat.systemActivityType !== 'END_SESSION' ||
          value.sessionExpired !== false;
        return isValid ? accumulator + 1 : accumulator;
      }, 0);

      setUnansweredCount(result || 0);

      return [...unansweredList, ...answeredList];
    };

    const onNewChatComming = (message) => {
      // console.log("NEW MESSAGE -----------------");
      // console.log(message);
      const index = chatRoomList.findIndex(
        (room) => room.roomId === message.roomId
      );
      const newChatRoomList = [...chatRoomList];

      if (index < 0) {
        newChatRoomList.push(message);
      } else {
        newChatRoomList[index] = message;
      }

      setChatRoomList(sortRoomList(newChatRoomList));
    };

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

        const isResponseSuccess =
          response.status >= 200 && response.status < 400;
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

    useEffect(() => {
      window.addEventListener('click', (e) => setShowChatMenu(false));
      getChatRoomList();
    }, []);

    const onSocketConnected = (e) => {
      console.log(e);
      console.log(`CONNECTED Messenger`);
    };

    const onSocketDisconnected = (e) => {
      console.log(e);
      console.log(`DISCONNECTED Messenger`);
    };

    const openPopup = (roomId) => {
      const target = chatRoomList.find((d) => d.roomId == roomId);

      if (target) {
        onChatPopupRequest(target);
      }

      return !!target;
    };

    React.useImperativeHandle(ref, () => ({
      openPopup,
    }));

    return (
      <div
        className={cx('container', minimized ? 'minimized' : '')}
        ref={contentContainer}
      >
        <SockJsClient
          url={`${serverUrl}/ws`}
          topics={[`/sub/brand/${brandId}`]}
          onMessage={onNewChatComming}
          ref={socketClient}
          headers={connectionHeaders}
          onDisconnect={onSocketDisconnected}
          onConnect={onSocketConnected}
        />
        <div className={cx('header')} onClick={onMinimizeIconClicked}>
          <MsgIcon className={cx('msg-icon')} />
          <div className={cx('content')}>
            <p className={cx('name')}>{brandName}</p>
            {unansweredCount && minimized ? (
              <p
                className={cx('newMsgCount')}
              >{`답변대기 ${unansweredCount}`}</p>
            ) : null}
          </div>
          <ArrowIcon className={cx('minimize-icon', minimized ? 'flip' : '')} />
        </div>
        <ChatRoomList
          serverUrl={serverUrl}
          brandId={brandId}
          onItemClick={onChatPopupRequest}
          data={chatRoomList}
          connectionHeaders={connectionHeaders}
          onChatRoomContextMenuOpen={onChatRoomContextMenuOpen}
          onScroll={() => setShowChatMenu(false)}
        />
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
  }
);

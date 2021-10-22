import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Messenger.module.css';
import { ChatRoomList } from './ChatRoomList';
import { ReactComponent as MsgIcon } from '../../resources/images/msg-icon.svg';
import { ReactComponent as ArrowIcon } from '../../resources/images/arrow-icon.svg';
import { ReactComponent as SearchIcon } from '../../resources/images/search-icon.svg';
import SockJsClient from 'react-stomp';

export const Messenger = ({onChatPopupRequest, connectionHeaders, brandId, brandName, serverUrl, ...props}) => {
  const cx = classNames.bind(styles);
  const [minimized, setIsMinimized] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const socketClient = useRef({});
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [chatRoomList, setChatRoomList] = useState([]);

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

      const isResponseSuccess = response.status >= 200 && response.status < 400;
<<<<<<< HEAD
      if(isResponseSuccess)
      {
        // console.log(resJson);
        setChatRoomList(sortRoomList(resJson.data));
      }
      else
      {
        // console.log(resJson);
        throw new Error(response.status);  
=======
      if (isResponseSuccess) {
        console.log(resJson);
        setChatRoomList(sortRoomList(resJson.data));
      } else {
        console.log(resJson);
        throw new Error(response.status);
>>>>>>> 48ed61f (chore: update .prettierrc / vscode common setting / formatted codes)
      }
    } catch (e) {
      console.log(e);
    }
  };

  const sortRoomList = (roomList) => {
    const unansweredList = roomList.filter((room) => room.unansweredChats > 0);
    const answeredList = roomList.filter((room) => room.unansweredChats == 0);

    const sortByDate = (a, b) => {
      const aTime = new Date(a.latestChat.messageDt);
      const bTime = new Date(b.latestChat.messageDt);

      return bTime - aTime;
    };

    unansweredList.sort(sortByDate);
    answeredList.sort(sortByDate);

    setUnansweredCount(unansweredList.length);

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

  useEffect(() => {
    getChatRoomList();
  }, []);

  return (
<<<<<<< HEAD
    <div className={cx('container',minimized?'minimized':'')}>
      <SockJsClient url={`${serverUrl}/ws`} topics={[`/sub/brand/${brandId}`]}
=======
    <div className={cx('container', minimized ? 'minimized' : '')}>
      <SockJsClient
        url="https://influencer-chat.fnf.co.kr/ws"
        topics={[`/sub/brand/${brandId}`]}
>>>>>>> 48ed61f (chore: update .prettierrc / vscode common setting / formatted codes)
        onMessage={onNewChatComming}
        ref={socketClient}
        headers={connectionHeaders}
      />
      <div className={cx('header')} onClick={onMinimizeIconClicked}>
        <MsgIcon className={cx('msg-icon')} />
        <div className={cx('content')}>
<<<<<<< HEAD
          <p className={cx('name')}>{brandName}</p>
          {(unansweredCount && minimized) ? <p className={cx('newMsgCount')}>{`답변대기 ${unansweredCount}`}</p> : null}
=======
          <p className={cx('name')}>Discovery</p>
          {unansweredCount && minimized ? (
            <p className={cx('newMsgCount')}>{`답변대기 ${unansweredCount}`}</p>
          ) : null}
>>>>>>> 48ed61f (chore: update .prettierrc / vscode common setting / formatted codes)
        </div>
        <ArrowIcon className={cx('minimize-icon', minimized ? 'flip' : '')} />
      </div>
      <div className={cx('search')}>
        <SearchIcon className={cx('search-icon')} />
        <input
          className={cx('search-input')}
          type="text"
          placeholder="이름 또는 핸드폰번호 검색"
        />
      </div>
      <ChatRoomList onItemClick={onChatPopupRequest} data={chatRoomList} />
    </div>
  );
};

import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import React,{useContext, useState,useEffect} from 'react'
import { UserType } from '../UserContext';
import { useNavigation } from '@react-navigation/native';
import UserChat from "../components/UserChat";

const ChatScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();

  useEffect(() => {
    const acceptedFriendList = async() => {
      try{
        const response = await fetch(`http://192.168.30.231:8000/accepted-friends/${userId}`);
        const data = await response.json();
        if(response.ok){
          setAcceptedFriends(data);
        }
      }
      catch(err){
        console.log("Error showing accepted friends:",err);
      }
    }

    acceptedFriendList();
  },[])

  console.log("Friends :",acceptedFriends);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item,index) => (
          <UserChat key={index}item={item}/>
        ))}
      </Pressable>
    </ScrollView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({})
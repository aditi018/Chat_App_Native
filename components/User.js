import { StyleSheet, Text, View,Pressable,Image, useColorScheme } from 'react-native'
import React,{useContext, useState} from 'react'
import { UserType } from '../UserContext'

const User = ({item}) => {
    const {userId, setUserId} = useContext(UserType);
    const [requestSent, setRequestSent] = useState(false);

    const sendFriendRequest = async(currentUserId, selectedUserId) =>{
        try{
            const response = await fetch("http://192.168.30.231:8000/friend-request",{
                method : "POST",
                headers:{
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({currentUserId,selectedUserId})
            })

            if(response.ok){
                setRequestSent(true);
            }
        }catch(err){
            console.log("error: ",err);
        }
    }

  return (
    <Pressable style={{flexDirection:"row",alignItems:"center",marginVertical:10}}>
      <View>
            <Image 
                style={{
                    width:50, 
                    height:50,
                    borderRadius:25
                }} 
                source={{uri : item.image}} />
      </View>

      <View style={{marginLeft:12,flex:1}}>
        <Text style={{fontWeight:"bold"}}>{item?.name}</Text>
        <Text style={{marginTop:4,color:"grey"}}>{item?.email}</Text>
      </View>
      <Pressable 
      onPress={() => sendFriendRequest(userId, item._id)}
        style={{
            backgroundColor:"#567189",
            padding:10,borderRadius:6,
            width:105
        }}>
        <Text style={{textAlign:"center",color:"white",fontSize:13}}>Add Friend</Text>
      </Pressable>
    </Pressable>
  )
}

export default User

const styles = StyleSheet.create({})
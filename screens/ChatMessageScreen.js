import { StyleSheet, Text, View,ScrollView,KeyboardAvoidingView, TextInput, Pressable } from 'react-native'
import React, { useState } from 'react';
import { Entypo } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import EmojiSelector from 'react-native-emoji-selector';

const ChatMessageScreen = () => {
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [message, setMessage] = useState("")

    const handleEmojiPress = () =>{
        setShowEmojiSelector(!showEmojiSelector);
    }

  return (
    <KeyboardAvoidingView style={{flex:1, backgroundColor:"#F0F0F0"}}>
      <ScrollView>

      </ScrollView>

      <View 
        style={{
            flexDirection:"row",
            alignItems:"center",
            paddingHorizontal:10,
            paddingVertical:10,
            borderTopWidth:1,
            borderTopColor:"#dddddd",
            marginBottom: showEmojiSelector ? 0 : 25
        }}
       >
        <Entypo 
            onPress={handleEmojiPress}
            style={{
                marginRight:5
            }} 
            name="emoji-happy" 
            size={24} 
            color="gray" 
        />
        <TextInput 
            value={message}
            onChangeText={(text) => setMessage(text)}
            style={{
                flex:1, 
                height:40, 
                borderWidth:1, 
                borderColor:"#dddddd",
                borderRadius:20, 
                paddingHorizontal:10
            }} 
            placeholder='Type your message...' 
        />
        <View 
            style={{
                flexDirection:"row",
                alignItems:"center" ,
                gap:7,
                marginHorizontal:8
            }}
        >
            <Entypo name='camera' size={24} color="gray"/>
            <Feather name='mic' size={24} color="gray" />
        </View>
        <Pressable 
            style={{
                backgroundColor:'#007bff',
                paddingVertical:8,
                paddingHorizontal:12, 
                borderRadius:20,
            }}
        >
            <Text 
                style={{
                    color:"white",
                    fontWeight:"bold"
                }}
            >Send</Text>
        </Pressable>
      </View>
      {showEmojiSelector && (
        <EmojiSelector 
            style={{height:250,}} 
            onEmojiSelected={(emoji) =>{
            setMessage((preMessage) => preMessage + emoji)
        }}/>
      )}
    </KeyboardAvoidingView>
  )
}

export default ChatMessageScreen

const styles = StyleSheet.create({})
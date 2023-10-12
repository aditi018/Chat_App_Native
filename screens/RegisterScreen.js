import { StyleSheet, Text, View, KeyboardAvoidingView,TextInput,Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const RegisterScreen = () => {

    const [ email,setEmail] = useState("");
    const [ name, setName] = useState("");
    const [ password, setPassword] = useState("");
    const [image, setImage] = useState("");
    const navigation = useNavigation();

    const handleRegister = () =>{
        const user = {
            name : name,
            email : email,
            password : password,
            image: image
        }

        axios.post("http://192.168.30.231:8000/register",user).
        then((response)=>{
            console.log(response);
            if(response.status === 200){
                Alert.alert(
                    "Registration Successful",
                    "You ahve been registered successfully"
                );
                setName("");
                setEmail("");
                setPassword("");
                setImage("");
            }
            else{
                Alert.alert(
                    "Registration failed",
                    "An error occurred while registering"
                )
            }
        }).catch((err)=>{
            Alert.alert(
                "Registration failed",
                "An error occurred while registering"
            )
            console.log("Registration failed",err)
        })
    }

  return (
    <View style={{
        flex:1, 
        backgroundColor:"white",
        padding:10, 
        alignItems :"center"
     }}
    >

    <KeyboardAvoidingView>
        <View style={{
            marginTop:100,
            justifyContent:"center",
            alignItems:"center"
            }}
        >
            <Text style={{
                color:"#4A55A2",
                fontSize:21, 
                fontWeight:"600"
                }}
            >Register</Text>
            <Text style={{
                fontSize:21, 
                fontWeight:"600",
                marginTop:15
                }}
            >Register to Your Account</Text>
        </View>

        <View style={{marginTop:50}}>
        
            <View style={{marginTop:10}}>
                <Text style={{
                    fontSize:18, 
                    fontWeight:"600",
                    color:"gray"
                    }}
                >Name</Text>
                <TextInput
                 value={name}
                 onChangeText={(text) => setName(text)}
                 style={
                    {
                        fontSize :name ? 18 : 18,
                        // borderBlockColor:"gray" , 
                        borderBottomWidth:1, 
                        marginVertical:10, 
                        width:300
                    }
                 }
                 placeholderTextColor={"black"} 
                 placeholder='Enter your name'/>
            </View>
            <View>
                <Text style={{
                    fontSize:18, 
                    fontWeight:"600",
                    color:"gray"
                    }}
                >Email</Text>
                <TextInput
                 value={email}
                 onChangeText={(text) => setEmail(text)}
                 style={
                    {
                        fontSize : email ? 18 : 18,
                        // borderBlockColor:"gray" , 
                        borderBottomWidth:1, 
                        marginVertical:10, 
                        width:300
                    }
                 }
                 placeholderTextColor={"black"} 
                 placeholder='Enter your email'/>
            </View>

            <View style={{marginTop:10}}>
                <Text style={{
                    fontSize:18, 
                    fontWeight:"600",
                    color:"gray"
                    }}
                >Password</Text>
                <TextInput
                 value={password}
                 secureTextEntry={true}
                 onChangeText={(text) => setPassword(text)}
                 style={
                    {
                        fontSize : password ? 18 : 18,
                        // borderBlockColor:"gray" , 
                        borderBottomWidth:1, 
                        marginVertical:10, 
                        width:300
                    }
                 }
                 placeholderTextColor={"black"} 
                 placeholder='Password'/>
            </View>
            <View style={{marginTop:10}}>
                <Text style={{
                    fontSize:18, 
                    fontWeight:"600",
                    color:"gray"
                    }}
                >Image</Text>
                <TextInput
                 value={image}
                 onChangeText={(text) => setImage(text)}
                 style={
                    {
                        fontSize : image ? 18 : 18,
                        // borderBlockColor:"gray" , 
                        borderBottomWidth:1, 
                        marginVertical:10, 
                        width:300
                    }
                 }
                 placeholderTextColor={"black"} 
                 placeholder='Image'/>
            </View>

            <Pressable
            onPress={handleRegister}
             style={
                {
                    width:200, 
                    backgroundColor:"#4A55A2",
                    padding:15,
                    marginTop:50,
                    marginLeft:"auto",
                    marginRight:"auto",
                    borderRadius:6
                }
            }>
                <Text style={{
                    color:"white",
                    fontSize:16,
                    fontWeight:'bold',
                    textAlign:"center"
                }}>Register</Text>
            </Pressable>

            <Pressable onPress={() =>navigation.goBack() } style={{marginTop:15}}>
                <Text style={{textAlign:"center",color:"gray",fontSize:16}}>Already have an account? Sign In</Text>
            </Pressable>
        </View>
    </KeyboardAvoidingView>
      
    </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({})
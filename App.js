import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View, TextInput } from "react-native";
import { useFonts } from "expo-font";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [accessToken, setAccessToken] = useState();
  const [userInfo, setUserInfo] = useState();
  const [summary, setSummary] = useState();
  console.log(summary ? summary : "no summary setted");
  const [remainTime, setRemainTime] = useState();
  const [trigger, setTrigger] = useState();
  const [calendar, setCalendar] = useState();
  console.log(remainTime ? "true" : "false");
  const [newHour, setNewHour] = useState();
  const [newMin, setNewMin] = useState();
  const [connected, setConnected] = useState();
  /*   console.log(userInfo ? "logged in" : "no login");
  console.log(remainTime ? remainTime : "remain time not setted");
  console.log("new hour:" + newHour);
  console.log("new min:" + newMin); */

  //when keyboard open slide input area up
  //if phone connected internet
  //when screen closed keep Timer
  //if screen closed and timer topped send notification
  //put button for arrange screen lock for selected time
  //check styles for android
  //nasil release oluyor ogren

  const currentDate = new Date().toISOString();
  console.log("current date:" + currentDate);
  const date = new Date();
  const trimDate1 = currentDate.slice(0, 11);
  const trimDate2 = currentDate.slice(16, 25);
  const currentHours = date.getHours() - 3;
  const currentMinutes = date.getMinutes();
  const endTime = trimDate1 + newHour + ":" + newMin + trimDate2;
  console.log("end date:" + endTime);

  const resetAll = () => {
    setCalendar();
    setTrigger();
    setConnected();
    setSummary();
    setRemainTime();
    setNewHour();
    setNewMin();
    console.log("reseted");
  };

  const resetTimer = () => {
    setCalendar();
    setTrigger();
    setRemainTime();
    setNewHour();
    setNewMin();
    console.log("reseted");
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "116079516670-s6ld2sgqf8o1uluihs6jsamog5nbakhm.apps.googleusercontent.com",
    iosClientId:
      "116079516670-mgcgbpepqmrh5ot42o3mt0ta7m5mp58m.apps.googleusercontent.com",
    expoClientId:
      "116079516670-aqjnii9b5ogubs408ks8i0vjr5j6p6ft.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  //get accessToken from Google
  useEffect(async () => {
    if (response?.type === "success") {
      setAccessToken(response.authentication.accessToken);
      if (accessToken) {
        let userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        userInfoResponse.json().then((data) => {
          setUserInfo(data);
        });
      }
    }
  }, [response, accessToken]);

  //click to signin to Google
  const GoogleSign = () => {
    return (
      <>
        <View>
          <Button
            title={accessToken ? "" : "Login Google"}
            onPress={() => {
              promptAsync();
            }}
            disabled={userInfo ? true : false}
          />
          <Text style={styles.text}>{userInfo ? userInfo.name : null}</Text>
        </View>
      </>
    );
  };

  useEffect(async () => {
    if (calendar && userInfo && summary) {
      let userCalendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${userInfo.email}/events`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            summary: summary,
            end: {
              dateTime: endTime,
            },
            start: {
              dateTime: currentDate,
            },
          }),
        }
      );
      userCalendarResponse.json().then((data) => {
        console.log(data);
        if (data.status === "confirmed") {
          console.log("sent end date:" + data);
          setConnected(true);
        }
      });
    } else console.log("Failed to Send");
  }, [calendar, userInfo]);

  //font load
  const [font] = useFonts({
    Orbitron: require("./assets/orbitron-regular.ttf"),
  });

  if (!font) {
    return null;
  }

  //Quotes later
  /*   const Quotes = () => {
    const quotes = [
      "With self awareness we can respond but without self awareness we just react",
      "Life begins at the end of your comfort zone",
      "The biggest obstacle to any transformation is literally just the way we’ve always done things",
    ];

    let random = Math.floor(Math.random() * 3);

    return (
      <>
        <Text style={styles.text}>{quotes[random]}</Text>
      </>
    );
  }; */

  const calculateEndTime = () => {
    if (currentMinutes + remainTime > 59) {
      setNewHour(currentHours + 1);
      setNewMin(currentMinutes + remainTime - 60);
    } else {
      setNewHour(currentHours);
      setNewMin(currentMinutes + remainTime);
    }
    if (newMin < 10) {
      return setNewMin(String(newMin).padStart(2, 0));
    }
  };

  const CountDown = () => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
      if (userInfo && !summary) {
        resetTimer();
        //eger login olduysan ancak summaryin yoksa butona tiklandiginda resetle, bu logini kontrol ediyor
      }
      if (trigger) {
        setSeconds(59);
        setMinutes(remainTime - 1);
        calculateEndTime();
        setCalendar(true);
      }
    }, [trigger]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes !== 0) {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
      //needs a cleanup function
      return () => clearInterval(interval);
    }, [seconds]);
    /*     const increaseMinutes = (props) => {
      setSeconds(59);
      setMinutes(props + 1);
    };

    const decreaseMinutes = (props) => {
      if (props >= 1) {
        setSeconds(59);
        setMinutes(props - 1);
      } else return;
    }; */

    //make seconds double numeric
    const Seconds = (props) => {
      return String(props.second).padStart(2, "0");
    };

    return (
      <>
        <View style={styles.row}>
          <Button
            title="30 min"
            onPress={() => {
              resetTimer();
              setRemainTime(30);
              setTrigger(true);
            }}
          />
          <Button
            title="45 min"
            onPress={() => {
              resetTimer();
              setRemainTime(45);
              setTrigger(true);
            }}
          />
          <Button
            title="60 min"
            onPress={() => {
              resetTimer();
              setRemainTime(60);
              setTrigger(true);
            }}
          />
          {/*           <Button title="-" onPress={() => decreaseMinutes(minutes)} />
          <Button title="+" onPress={() => increaseMinutes(minutes)} /> */}
        </View>
        <View style={styles.row}>
          <Text style={styles.countdown}>
            {minutes}
            :
            <Seconds second={seconds} />
          </Text>
        </View>
        <Button title="Reset" onPress={() => resetAll()} />
      </>
    );
  };

  const Input = () => {
    const [input, setInput] = useState("");

    return (
      <>
        <View style={{ flexDirection: "column" }}>
          <TextInput
            style={styles.text}
            placeholder={summary ? summary : "Doing What Now?"}
            placeholderTextColor="#17d4fe"
            keyboardType="default"
            returnKeyType={"done"}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => {
              setSummary(input);
            }}
          ></TextInput>
        </View>
      </>
    );
  };

  const CheckSteps = () => {
    if (!accessToken) {
      return (
        <Text style={styles.text}>
          Login to Send Time Data to Your Calendar{" "}
        </Text>
      );
    }
    if (!summary) {
      return (
        <Text style={styles.text}>
          {summary ? "Select Time" : "Enter What Are You Doing Now"}
        </Text>
      );
    }
    return (
      <Text style={styles.text}>
        {connected ? "Success, Check Calendar" : "Now Select Timer"}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <CheckSteps />
      {/*       <Quotes /> */}
      <CountDown />
      <Input />
      <GoogleSign />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  countdown: {
    color: "#17D4FE",
    fontSize: 40,
    fontFamily: "Orbitron",
    letterSpacing: 7,
  },
  text: {
    color: "#17d4fe",
    fontSize: 20,
    fontFamily: "Helvetica",
    letterSpacing: 7,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 40,
    margin: 20,
  },
});

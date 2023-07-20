import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { router } from "expo-router";

export default function NewScreen() {
  const cameraRef = useRef(null);
  const { height, width } = Dimensions.get("window");

  const [camPermission, requestCamPermission] = Camera.useCameraPermissions();
  const [micPermission, requestMicPermission] =
    Camera.useMicrophonePermissions();

  const [type, setType] = useState(CameraType.front);
  const [xPadding, setXPadding] = useState(0);
  const [isRatioSet, setIsRatioSet] = useState(false);
  const [ratio, setRatio] = useState(Camera.defaultProps.ratio);

  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    })();
    return async () => {
      await ScreenOrientation.unlockAsync();
    };
  }, []);

  const prepareRatio = async () => {
    // This issue only affects Android
    if (Platform.OS === "android") {
      let desiredRatioStr = Camera.defaultProps.ratio; // Start with the system default
      let desiredRatioVal = desiredRatioStr
        .split(":")
        .reduce((t, n) => parseInt(t) / parseInt(n));
      const lWidth = height;
      const lHeight = width;
      const screenRatio = lWidth / lHeight;

      const ratios = await cameraRef.current.getSupportedRatiosAsync();
      for (const ratio of ratios) {
        // Get a ratio that is closest to the screen ratio without going over
        const ratioVal = ratio
          .split(":")
          .reduce((t, n) => parseInt(t) / parseInt(n));
        if (ratioVal < screenRatio && ratioVal > desiredRatioVal) {
          desiredRatioStr = ratio;
          desiredRatioVal = ratioVal;
        }
      }
      // console.log("Desired ratio: ", desiredRatioStr);
      // Add padding to the sides of the camera
      const sidePadding = (lWidth - desiredRatioVal * lHeight) / 2;
      setXPadding(sidePadding);
      setRatio(desiredRatioStr);
      // Set a flag so we don't do this
      // calculation each time the screen refreshes
      setIsRatioSet(true);
    }
  };

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const onCameraReady = async () => {
    if (!isRatioSet) await prepareRatio();
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const { uri } = await cameraRef.current.recordAsync({
          quality: Camera.Constants.VideoQuality["720p"],
          maxDuration: 60 * 60 * 1, // 1 hour,
          mirror: true,
        });
        console.log("Video saved at", uri);
        router.push({ pathname: "/video", params: { uri: uri } });
      } catch (error) {
        console.warn(error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      setIsRecording(false);
      cameraRef.current.stopRecording();
    }
  };

  if (!camPermission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!camPermission?.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestCamPermission} title="grant permission" />
      </View>
    );
  }
  if (!micPermission?.granted) {
    // Microphone permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to record audio
        </Text>
        <Button onPress={requestMicPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={[styles.camera, { marginHorizontal: xPadding }]}
        type={type}
        onCameraReady={onCameraReady}
        ratio={ratio}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (isRecording) stopRecording();
              else {
                stopRecording();
                startRecording();
              }
            }}
          >
            <Text style={styles.text}>🎥</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    height: "100%",
    right: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  button: {
    margin: 5,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});

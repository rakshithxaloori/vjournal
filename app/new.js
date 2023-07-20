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

export default function App() {
  const cameraRef = useRef(null);
  const [type, setType] = useState(CameraType.back);
  const [ratio, setRatio] = useState(Camera.defaultProps.ratio);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  // Screen Ratio and image padding
  const [xPadding, setXPadding] = useState(0);
  const [yPadding, setYPadding] = useState(0);
  const { height, width } = Dimensions.get("window");
  const [isRatioSet, setIsRatioSet] = useState(false);

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
    console.log("Preparing ratio...");
    let desiredRatioStr = Camera.defaultProps.ratio; // Start with the system default
    let desiredRatioVal = desiredRatioStr
      .split(":")
      .reduce((t, n) => parseInt(t) / parseInt(n));
    // This issue only affects Android
    if (Platform.OS === "android") {
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
      console.log("Desired ratio: ", desiredRatioStr);
      // Add padding to the sides of the camera
      const sidePadding = (lWidth - desiredRatioVal * lHeight) / 2;
      setXPadding(sidePadding);

      // if (screenRatio > desiredRatioVal) {
      //   // Add padding to the sides of the camera
      //   const sidePadding = (lWidth - desiredRatioVal * lHeight) / 2;
      //   setXPadding(sidePadding);
      // } else {
      //   // Add padding to the top and bottom of the camera
      //   const bottomPadding = (lHeight - lWidth / desiredRatioVal) / 2;
      //   setYPadding(bottomPadding);
      // }

      setRatio(desiredRatioStr);
      // Set a flag so we don't do this
      // calculation each time the screen refreshes
      setIsRatioSet(true);
    }
  };

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  const onCameraReady = async () => {
    if (!isRatioSet) await prepareRatio();
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={[
          styles.camera,
          {
            marginHorizontal: xPadding,
            marginVertical: yPadding,
          },
        ]}
        type={type}
        onCameraReady={onCameraReady}
        ratio={ratio}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>❤️</Text>
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
  information: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});

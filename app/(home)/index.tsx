import { NavigationProp, useNavigation } from "@react-navigation/native";

import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  Text,
} from "react-native";

type RootStackParamList = {
  Todos: undefined; // Add all other routes here with their params if needed
};

type NavigationProps = NavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  return (
    <ImageBackground
      source={require("../../assets/images/bg-img.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <View style={styles.body}>
        <Image
          style={{ width: 150, height: 100 }}
          source={require("../../assets/images/Databricks_Logo.png")}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Todos")}
          style={styles.button}
        >
          <Text style={{ color: "#ffff", fontSize: 24, fontWeight: "bold" }}>
            Open Crud
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(191, 255, 255, 0.64)",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  button: {
    backgroundColor: "#5696b0",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 20,
    shadowColor: "#000",
  },
});

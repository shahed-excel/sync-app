import {
  StyleSheet,
  Platform,
  View,
  Text,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  TouchableOpacity,
} from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { useEffect, useState } from "react";
import {
  deleteTodo,
  getAllTodos,
  getMyTodos,
  insertTodo,
  pullData,
  updateTodo,
} from "@/database/queries";

import * as Device from "expo-device";

import axios from "axios";

import CustomButton from "@/components/buttons/CustomButton";
import Toast from "react-native-toast-message";
import React from "react";

export default function Todos() {
  const deviceId =
    (Device.deviceName as string) +
    Device.deviceYearClass +
    Device.osName +
    Device.osInternalBuildId;

  const [id, setId] = useState(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState<any>([]);
  const [myTodos, setMyTodos] = useState<any>([]);
  const [errors, setErrors] = useState<{
    device?: string;
    title: string;
    content: string;
  }>({
    device: "",
    title: "",
    content: "",
  });

  const validateFields = () => {
    let isValid = true;
    const newErrors = { title: "", content: "" };

    if (!title.trim()) {
      newErrors.title = "Title is required.";
      isValid = false;
    }
    if (!content.trim()) {
      newErrors.content = "Content is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async () => {
    let maxId;

    if (myTodos.length > 0) {
      maxId = Math.max(...myTodos.map((item: any) => item.id)) + 1;
    } else {
      maxId = 1;
    }

    if (!validateFields()) return;
    try {
      await insertTodo({
        id: maxId,
        device: deviceId,
        title: title.trim(),
        content: content.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Item Added successfully",
      });

      getTodosFromDB();
      clearFields();

      Keyboard.dismiss();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
      console.error("Failed to save todo:", error);
    }
  };

  const handleUpdateTodo = async () => {
    if (!validateFields()) return;

    try {
      await updateTodo({
        id: id,
        title: title.trim(),
        content: content.trim(),
      });
      getTodosFromDB();
      clearFields();
      Keyboard.dismiss();
      Toast.show({
        type: "success",
        text1: "Item Updated successfully",
      });
    } catch (error) {
      console.error("Failed to update todo:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update item",
      });
    }
  };

  const getTodosFromDB = async () => {
    try {
      const dbTodos = await getAllTodos();
      const dbMyTodos = await getMyTodos(deviceId);
      setTodos(dbTodos);
      setMyTodos(dbMyTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const updateTodos = (todo: any) => {
    setId(todo.id);
    setTitle(todo.title);
    setContent(todo.content);
  };

  const clearFields = () => {
    setId(undefined);
    setTitle("");
    setContent("");
    setErrors({ title: "", content: "" });
  };

  useEffect(() => {
    getTodosFromDB();
  }, []);

  const handleSyncData = async () => {
    try {
      // Make the API call to the backend
      const response = await axios.post(
        "http://192.168.110.135:3000/sync",
        myTodos
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Data Synced successfully",
        });
        getTodosFromDB();
      }
    } catch (err) {
      console.error("Error syncing data:", err);
      Alert.alert("Sync Failed", "Failed to sync data, please try again.");
    }
  };

  const handlePullData = async () => {
    try {
      // Make the API call to the backend
      const response = await axios.get("http://192.168.110.135:3000/pull");

      if (response.status === 200) {
        console.log("Data Pull Successful", response.data);
        setTodos(response.data);
        pullData(response.data);
        Toast.show({
          type: "success",
          text1: "Data Pulled successfully",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log("my", myTodos);
  console.log("todos", todos);

  return (
    <View style={styles.body}>
      <View style={{ backgroundColor: "#c2f2ff", borderRadius: 10 }}>
        <View style={{ marginTop: 20, padding: 20 }}>
          <View style={[styles.titleContainer, { marginBottom: 10 }]}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>Welcome!</Text>
            <HelloWave />
          </View>
          <Text>Title</Text>
          <TextInput
            onChangeText={(newText) => setTitle(newText)}
            value={title}
            style={styles.input}
            placeholder="Enter Title"
          />
          {errors.title ? (
            <Text style={styles.errorText}>{errors.title}</Text>
          ) : null}

          <Text>Content</Text>
          <TextInput
            onChangeText={(newText) => setContent(newText)}
            value={content}
            style={styles.input}
            placeholder="Enter Content"
          />
          {errors.content ? (
            <Text style={styles.errorText}>{errors.content}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            {!id ? (
              <TouchableOpacity
                onPress={onSubmit}
                style={[
                  styles.button,
                  { backgroundColor: "#2196f3", width: "48%" },
                ]}
              >
                <Text style={{ color: "#ffff" }}>Add</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleUpdateTodo}
                style={[
                  styles.button,
                  { backgroundColor: "#2196f3", width: "48%" },
                ]}
              >
                <Text style={{ color: "#ffff" }}>Update</Text>
              </TouchableOpacity>
              // <Button title="Update" onPress={handleUpdateTodo} />
            )}
            <TouchableOpacity
              onPress={clearFields}
              style={[
                styles.button,
                { backgroundColor: "#f6a463", width: "48%" },
              ]}
            >
              <Text style={{ color: "#ffff" }}>Clear Fields</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSyncData}
            style={[styles.button, { backgroundColor: "#265f3f" }]}
          >
            <Text style={{ color: "#ffff" }}>Sync Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePullData}
            style={[styles.button, { backgroundColor: "#37895b" }]}
          >
            <Text style={{ color: "#ffff" }}>Pull Data</Text>
          </TouchableOpacity>
          {/* <Button title="Sync Data" color={"blue"} onPress={handleSyncData} /> */}
          {/* <Button title="Pull Data" color={"red"} onPress={handlePullData} /> */}
        </View>
      </View>

      <View style={{ marginTop: 20, backgroundColor: "#f2f2f2", flex: 1 }}>
        <View style={styles.tableHeader}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>ID</Text>
          <Text style={{ flex: 2, fontWeight: "bold" }}>Title</Text>
          <Text style={{ flex: 3, fontWeight: "bold" }}>Content</Text>
          <Text style={{ flex: 2, fontWeight: "bold", textAlign: "center" }}>
            Actions
          </Text>
        </View>

        {/* FlatList for Items */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString() + item.device}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1 }}>{item?.id}</Text>
              <Text style={{ flex: 2 }}>{item?.title}</Text>
              <Text style={{ flex: 3 }}>{item?.content}</Text>
              <View style={styles.actionButtons}>
                <CustomButton
                  disabled={deviceId !== item.device}
                  item={item}
                  icon="edit"
                  color="white"
                  onPress={() => updateTodos(item)}
                />
                <CustomButton
                  disabled={deviceId !== item.device}
                  icon="trash"
                  color="white"
                  onPress={() => {
                    Alert.alert(
                      "Delete Confirmation",
                      "Are you sure you want to delete this item?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteTodo(item.id);
                              getTodosFromDB();
                              clearFields();
                              Toast.show({
                                type: "success",
                                text1: "Item deleted successfully",
                              });
                            } catch (error) {
                              console.error("Failed to delete todo:", error);
                              Toast.show({
                                type: "error",
                                text1: "Failed to delete item",
                              });
                            }
                          },
                        },
                      ]
                    );
                  }}
                />
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 25,
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: Platform.OS === "ios" ? 44 : 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
    backgroundColor: "#f2f2f2",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#c6d7e3",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    margin: 1,
  },
  actionButtons: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

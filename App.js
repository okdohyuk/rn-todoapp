import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  AsyncStorage,
  ScrollView
} from 'react-native';
import { AppLoading } from 'expo';
import uuidv1 from "uuid/v1";
import ToDo from './components/Todo';

const {height, width} = Dimensions.get("window");

export default class App extends React.Component {
    state = {
        newToDo: "",
        loadedToDos: false,
        toDos: {}
    }
    componentDidMount = () => {
      this._loadToDos();
    }
    render() {
        const {newToDo, loadedToDos, toDos } = this.state;
        if(!loadedToDos) {
          return (
          <AppLoading>
            <StatusBar barStyle="light-content" />
          </AppLoading>
          );
        }
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content"/>
                <Text style={styles.title}>뭐하지?</Text>
                <View style={styles.card}>
                    <TextInput
                        value={newToDo}
                        style={styles.input}
                        onChangeText={this._controllNewToDo}
                        placeholderTextColor={"#999"}
                        placeholder="새로운 할일!"
                        onSubmitEditing={this._addToDo}
                        returnKeyType={"done"}
                        blurOnSubmit={true}
                        autoCorrect={false}
                        underlineColorAndroid={"transparent"} />
                    <ScrollView contentContainerStyle={styles.toDos}>
                      {Object.values(toDos).map(toDo => (
                      <ToDo 
                      key={toDo.id} 
                      deleteToDo={this._deleteToDo} 
                      uncompleteToDo={this._uncompleteToDo}
                      completeToDo={this._completeToDo}
                      updateToDo={this._updateToDo}
                      {...toDo} 
                      />
                      ))}
                    </ScrollView>
                </View>
            </View>
        );
    }
    _controllNewToDo = text => {
      this.setState({
        newToDo: text
      });
    };
    _loadToDos = async () => {
      try {
        const toDos = await AsyncStorage.getItem("toDos");
        if (toDos) {
          const parsedToDos = JSON.parse(toDos);
          this.setState({ loadedToDos: true, toDos: parsedToDos || {} });
        } else {
          this.setState({
            loadedToDos: true,
            toDos: {}
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    _addToDo = async () => {
      const { newToDo, toDos } = this.state;
      if (newToDo !== "") {
        this.setState({
          newToDo: ""
        });
        this.setState(prevState => {
          const ID = uuidv1();
          const newToDoObject = {
            [ID]: {
              id: ID,
              isCompleted: false,
              text: newToDo,
              createdAt: Date.now()
            }
          };
          const newState = {
            ...prevState,
            toDos: { ...prevState.toDos, ...newToDoObject }
          };
          this._saveToDo(newState.toDos);
          return { ...newState };
        });
      }
    };
    _deleteToDo = id => {
      this.setState(prevState => {
        const toDos = prevState.toDos;
        delete toDos[id];
        const newState = {
          ...prevState,
          ...toDos
        };
        this._saveToDo(newState.toDos);
        return { ...newState };
      });
    };
  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: { ...prevState.toDos[id], isCompleted: false }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _completeToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: { ...prevState.toDos[id], isCompleted: true }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: { ...prevState.toDos[id], text }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _saveToDo = newToDos => {
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#139EB9',
        alignItems: 'center'
    },
    title: {
        color: "white",
        fontSize: 30,
        marginTop: 50,
        fontWeight: "200",
        marginBottom: 30
    },
    card: {
        backgroundColor: "white",
        flex: 1,
        width: width - 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: "rgb(50, 50, 50)",
                shadowOpacity: 0.5,
                shadowRadius: 5,
                shadowOffset: {
                    height: -1,
                    width: 0
                }
            },
            android: {
                elevation: 3
            }
        })
    },
    input: {
        padding: 20,
        borderBottomColor: "#bbb",
        borderBottomWidth: 1,
        fontSize: 25
    },
    toDos: {
        alignItems: "center"
    }
});
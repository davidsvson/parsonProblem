import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../main";
import { doc, getDoc } from "firebase/firestore";
import Highlight from 'react-highlight';
import "highlight.js/styles/default.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


import "./parson.css";

interface ListItem {
    id: string;
    text: string;
}

const Parson = () => {
    const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);
    const [list, setList] = useState<ListItem[]>([]);
    const [shuffledList, setShuffledList] = useState<ListItem[]>([]);
    const [comparisonResult, setComparisonResult] = useState<string>('');


    const [selectedLanguage, setSelectedLanguage] = useState<string>('');

    const params = useParams()

    useEffect(() => {
        const fetchData = async () => {
            if ('parsonId' in params) {
                const { rows, language } = await getRows(String(params.parsonId));

                const listItems: ListItem[] = rows.map((row, index) => {
                    return {
                        id: String(index + 1),
                        text: row,
                    };
                });


                setList(listItems);
                setShuffledList(shuffle(listItems));
                setSelectedLanguage(language);
            }
        };

        fetchData();
    }, [])


    const reorder = (list : ListItem[], startIndex : number, endIndex : number) : ListItem[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
      
        return result;
      };

    // const handleDragStart = (event: React.DragEvent<HTMLLIElement>, item: ListItem) => {
    //     setDraggedItem(item);
    //     event.dataTransfer.effectAllowed = 'move';
    //     event.dataTransfer.setData('text/plain', String(item.id));
    // };

    // const handleDragOver = (event: React.DragEvent<HTMLLIElement>) => {
    //     event.preventDefault();
    // };

    // const handleDrop = (event: React.DragEvent<HTMLLIElement>, targetIndex: number) => {
    //     event.preventDefault();
    //     const sourceIndex = shuffledList.findIndex(item => item.id === Number(event.dataTransfer.getData('text/plain')));
    //     const updatedList = [...shuffledList];
    //     const [removed] = updatedList.splice(sourceIndex, 1);
    //     updatedList.splice(targetIndex, 0, removed);
    //     setShuffledList(updatedList);
    //     setDraggedItem(null);
    // };

    const onDragEnd = () => {


    }

    const indentedList = indentList(shuffledList);

    const listElements = indentedList.map((item, index) => (
        <Droppable droppableId="droppable">
            {(provided, snapshot) => (
                <li
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                /* style={getListStyle(snapshot.isDraggingOver)} */

                >
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <Highlight className={selectedLanguage}>
                                    {item.text}
                                </Highlight>
                            </div>
                        )}
                    </Draggable>
                </li>
            )}
        </Droppable>
    ))

    const compareLists = () => {
        let result = "Correct!";

        for (let i = 0; i < list.length; i++) {
            if (list[i].text.trim() !== shuffledList[i].text.trim()) {
                result = `Error at line ${i + 1}`;
                break;
            }
        }

        setComparisonResult(result);
    };


    return (
        <div className="parson-container">
            <DragDropContext onDragEnd={onDragEnd}
            <ul className="parson-list">{listElements}</ul>


            <button className="check-button" onClick={compareLists}>Check Result</button>
            {comparisonResult && (
                <div className="comparison-result">{comparisonResult}</div>
            )}
        </div>
    );
}

const indentList = (items: ListItem[]): ListItem[] => {
    const indentation = '    '; // desired indentation
    const trimmedItems = items.map((item) => ({ ...item, text: item.text.trim() }));
    let indentLevel = 0;

    for (let i = 0; i < trimmedItems.length; i++) {
        const currentText = trimmedItems[i].text;
        const isClosingBrace = currentText.endsWith('}');
        const isStartingBrace = currentText.endsWith('{');

        if (isClosingBrace && indentLevel > 0) {
            indentLevel--;
        }

        trimmedItems[i].text = indentation.repeat(indentLevel) + currentText;

        if (isStartingBrace) {
            indentLevel++;
        }
    }

    return trimmedItems;
}

const getRows = async (id: string): Promise<{ rows: string[], language: string }> => {
    try {

        const docRef = doc(firestore, "parsonItems", id);
        const document = await getDoc(docRef);

        if (document.exists()) {
            const data = document.data();
            const rows: string[] = data.rows;
            const language: string = data.language;
            return { rows, language };
        } else {
            console.log('Document not found.');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }
    return { rows: [], language: '' };
}

const shuffle = (listItems: ListItem[]): ListItem[] => {
    const shuffledListItems = [...listItems];

    let currentIndex = shuffledListItems.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffledListItems[currentIndex], shuffledListItems[randomIndex]] = [
            shuffledListItems[randomIndex], shuffledListItems[currentIndex]
        ];
    }

    return shuffledListItems;
}

export default Parson;
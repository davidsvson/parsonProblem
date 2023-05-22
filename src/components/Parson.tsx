import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { compareLists, reorder, indentList, getRows, shuffle } from "./parsonUtils";
import Highlight from 'react-highlight';
import "highlight.js/styles/default.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

import "./parson.css";
import { StrictModeDroppable } from "./StrictModeDroppable";

interface ListItem {
    id: string;
    text: string;
}

const Parson = () => {
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

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const items = reorder(
            shuffledList,
            result.source.index,
            result.destination.index
        );

        setShuffledList(
            items
        );
    }

    const indentedList = indentList(shuffledList);

    const listElements = indentedList.map((item, index) => (
        <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided) => (
                <li
                    key={index}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Highlight className={selectedLanguage}>
                        {item.text}
                    </Highlight>
                </li>
            )}
        </Draggable>
    ));

    const handleCheckResult = () => {
        const result = compareLists(list, shuffledList);

        if (result > 0) {
            setComparisonResult('Fel på rad ' + result);
        } else {
            setComparisonResult('Rätt!');
        }
    }

    return (
        <div className="parson-container">
            <DragDropContext onDragEnd={onDragEnd} >
                <StrictModeDroppable droppableId="droppable">
                    {(provided) => (
                        <ul
                            className="parson-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {listElements}
                            {provided.placeholder}
                        </ul>
                    )}
                </StrictModeDroppable>
            </DragDropContext>
            <button className="check-button" onClick={handleCheckResult}>Check Result</button>
            {comparisonResult && (
                <div className="comparison-result">{comparisonResult}</div>
            )}
        </div>
    );
}

export default Parson;
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../main";

interface ListItem {
  id: string;
  text: string;
}

export const compareLists = (list1:  ListItem[], list2: ListItem[]) : number => {
    for (let i = 0; i < list1.length; i++) {
        if (list1[i].text.trim() !== list2[i].text.trim()) {
            return i + 1;
        }
    }

    return 0;
};

export const reorder = (list: ListItem[], startIndex: number, endIndex: number): ListItem[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const indentList = (items: ListItem[]): ListItem[] => {
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

export const getRows = async (id: string): Promise<{ rows: string[], language: string }> => {
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

export const shuffle = (listItems: ListItem[]): ListItem[] => {
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
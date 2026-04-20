
// Subpath — smaller bundle, only loads the category you need
import { Deque } from 'data-structure-typed/queue';
import { Stack } from 'data-structure-typed/stack';
import { DoublyLinkedList } from 'data-structure-typed/linked-list';

export type BasicBar = {
    id:string,
    value:number

}



const numbersMap = (numbers:number[]) => {
  return numbers.map((num) => ({ id: Math.random().toString(), value: num }));
}



const buildQueueFrames = (numbers:number[],num:number,op:string) => {

    const queue = new Deque<BasicBar>(numbersMap(numbers));


    if(op === "enqueue"){
        queue.push({id:Math.random().toString(),value:num});
    }
    if(op === "dequeue"){
        queue.shift();
    }
    if(op === "peek"){
        queue.peek()
    }
    if(op === "clear"){
        queue.clear();
    }

    

}

const buildLinkedListFrames = (numbers:number[],num:number,op:string) => {

    const linkedList = new DoublyLinkedList<BasicBar>(
        numbersMap(numbers)
    );

    if(op === "insertAtHead"){
        linkedList.addAfter(linkedList.head,{id:Math.random().toString(),value:num});   
    }
    if(op === "insertAtTail"){
        linkedList.addBefore(linkedList,{id:Math.random().toString(),value:num});
    }
    if(op === "deleteAtHead"){
        linkedList.delete(linkedList.head);
    }
    if(op === "deleteAtTail"){
        linkedList.deleteAt(-1);
    }
    if(op === "peekHead"){
        linkedList.head?.value
    }
    if(op === "peekTail"){
        linkedList.tail?.value
    }
if(op === "clear"){
    linkedList.clear();
}


}


const buildStackFrames = (numbers:number[],num:number,op:string) => {


    const stack = new Stack<BasicBar>(numbersMap(numbers));


    if(op == "push"){
        stack.push({id:Math.random().toString(),value:num})

    }
    else if(op == "pop"){
        stack.pop()
    }
    else if(op == "peek"){
        stack.peek()
    }
    else if (op == "clear"){
        stack.clear()
    }


}

const buildDequeFrames = (numbers:number[],num:number,op:string) => {
    const deque = new Deque<BasicBar>(numbersMap(numbers));




    if(op === "enqueueFirst"){
        deque.unshift({id:Math.random().toString(),value:num});
    }
    if(op === "enqueueLast"){
        deque.push({id:Math.random().toString(),value:num});
    }
    if(op === "dequeueFirst"){
        deque.shift();
    }
    if(op === "dequeueLast"){
        deque.deleteAt(-1);
    }
    if(op === "peek"){
        deque.peek()
    }
    if(op === "clear"){
        deque.clear();
    }

    


}

const buildDoubleLinkedListFrames = (numbers:number[],num:number,op:string) => {
    
    const dll  = new DoublyLinkedList<BasicBar>(numbersMap(numbers));



}

// Monotonic stack frames builder - reserved for future use
// const buildMonotonicStackFrames = (numbers:number[],num:number,op:string) => { };


const buildMonoQueueStackFrames = (numbers:number[],num:number,op:string) => {
  

    const monoq = new Deque<BasicBar>(numbersMap(numbers));
    
}




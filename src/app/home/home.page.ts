import { Component } from '@angular/core';
import { constants } from 'buffer';
declare var LeaderLine;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  rows:Array<IRow>=[];
  connections:Array<IConnection>=[];
  rowIdCounter=0;
  nodeIdCounter=0;
  drawing=false;
  startNode;
  endNode;
  constructor() {

  }
  async ionViewDidEnter(){
    await this.timeout(500);
    this.addRow();
    await this.timeout(500);
    this.addRow();
    await this.timeout(500);
    this.addNode(this.rows[0]);
    await this.timeout(500);
    this.addNode(this.rows[1]);
    await this.timeout(500);
    this.addNode(this.rows[1]);
  }
  addRow(){
    console.log("adding new row")
    let newRow:IRow={
      id:this.rowIdCounter,
      name:"row"+this.rowIdCounter,
      nodes:[]
    };
    this.rows.push(newRow);
    this.rowIdCounter++;
    console.log("rows:",this.rows.length);
  }

  addNode(row){
    console.log("creating node");
    let newNode:INode={
      id:"node"+this.nodeIdCounter,
      name:"node"+this.nodeIdCounter,
      connections:[],
      clicked:false
    }
    this.rows.find(x => x.id == row.id).nodes.push(newNode);
    this.nodeIdCounter++;
    console.log("row "+row.name+" has "+row.nodes.length+" nodes.");
    this.reposition();
  }

  removeNode(row,node){
    //remove node from row
    let nodeIndex= row.nodes.findIndex(x=> x.id == node.id);
    row.nodes.splice(nodeIndex,1);
    //remove any connections assocaited with that node
    this.connections.forEach((conn,i) =>{
      if(conn.origin===node.id || conn.destination === node.id){
        conn.line.remove();
        this.connections.splice(i,1);
      }
    });
    this.reposition();
  }

  hideConnections(){
    this.connections.forEach(conn => {
      console.log("hiding",conn);
      conn.line.hide('fade',{duration: 200, timing: 'linear'})
    });
  }
  
  showAllConnections(){
    this.connections.forEach(conn => {
      conn.line.show('fade',{duration: 200, timing: 'linear'})
    });
  }

  async showConnections(nodeId){
    console.log("showing connections from origin: "+nodeId);
    await this.timeout(100);
    this.connections.forEach(conn => {
      //If the connections exist on the bas node
      if(conn.origin === (nodeId)){
        console.log("showing: ", conn);
        conn.line.show('draw',{duration: 100, timing: 'linear'})
        //and show the connections of the destination node aswell
        this.showConnections(conn.destination);
      };
    });
  }

  drawLine(){
    console.log("drawing: ", this.startNode,this.endNode);
    let myLine = new LeaderLine(
      document.getElementById(this.startNode),
      document.getElementById(this.endNode),
      {color:'white'}
      );
    this.connections.push({
      origin:this.startNode,
      destination:this.endNode,
      line: myLine
    });
  }

  async reposition(){
    console.log("repositioning");
    await this.timeout(100);
    this.connections.forEach((conn,i) => {
      conn.line.remove();
      let myLine = new LeaderLine(
        document.getElementById(conn.origin),
        document.getElementById(conn.destination),
        {color:'white'}
        );
      conn.line=myLine;
    });
  }

  startDrawing(node){
    this.showConnections(node);
    this.drawing=true;
    this.startNode=node.id;
    console.log("drawing from:",node.name);
  }

  endDrawing(node){
    console.log("to:",node.name);
    this.endNode=node.id;
    this.drawing=false;
    this.drawLine();
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface INode{
  id:string;
  name:string;
  connections:Array<number>;
  clicked:boolean;
}

export interface IRow{
  id:number;
  name:string;
  nodes:Array<INode>;
}

export interface IConnection{
  origin:string;
  destination:string;
  line:any;
}

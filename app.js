//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-islamzedd:testpassword123@cluster0.gnljvu3.mongodb.net/todolistDB");

const toDoListSchema = new mongoose.Schema({
  name:String
});

const Item = new mongoose.model("item",toDoListSchema);

const welcome = new Item({
  name:"Welcome to your ToDo List"
});

const add = new Item({
  name:"Hit the + to add a new item"
});

const del = new Item({
  name:"<-- Click here to delete an item"
});

const defaultItems = [welcome,add,del];

const listSchema = new mongoose.Schema({
  name:String,
  items:[toDoListSchema]
});

const List = new mongoose.model("list",listSchema);

app.get("/", function(req, res) {
  //const day = date.getDate();

  Item.find({},(err,items)=>{
    if(items.length===0){
      Item.insertMany(defaultItems,(err)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log("items inserted");
        }
      });
      res.redirect("/");
    }
    res.render("list", {listTitle: "Today", items: items});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listTitle},(err,list)=>{
      list.items.push(item);
      list.save();
      res.redirect("/"+listTitle);
    });
  }
});

app.post("/delete",function(req,res){
  const itemID = req.body.checkbox;
  const listTitle = req.body.listTitle;

  if(listTitle === "Today"){
    Item.deleteOne({_id:itemID},(err)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:itemID}}},(err,list)=>{
      if(!err){
        res.redirect("/"+listTitle);
      }
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,list)=>{
    if(err){
      console.log(err);
    }
    else if (list == null){
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: list.name, items: list.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});

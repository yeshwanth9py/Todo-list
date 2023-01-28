const express = require("express");
const bodyparser = require("body-parser");
const app = express();
// const dayy = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

// var items = ["buy food", "make food", "eat food"];
// var workitems= [];


app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yeswanth:yeswanth@cluster0.hx74iyh.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
mongoose.set('strictQuery', true);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function (req, res) {
    // let day = dayy.needate();
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("error occured");
                } else {
                    console.log("Successfully saved defult items to DB.");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });
});

app.post("/", function (requ, res) {
    const itemName = requ.body.item;
    const listName = requ.body.list;

    /* if (requ.body.button === "work list") {
        workitems.push(item);
        res.redirect("/work");
    } else {
        items.push(item)
        res.redirect("/");
    } */

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    



});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfully deleted checked item.");
                res.redirect("/");
            }
    });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

    
})

/* app.get("/work", function (req, res) {
    res.render("list", { listTitle: "work list", newlistitems: workitems })
}); */

app.get("/about", function (req, res) {
    res.render("about");
});


app.listen(3000, function () {
    console.log("server started at port 3000");
});

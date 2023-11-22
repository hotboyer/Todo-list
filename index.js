//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://babsamuel2196:MERviccity2022@cluster0.8spubdv.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "welcome to the todolist!"
})

const Item2 = new Item({
  name: "Hit the + button to add a new item"
})

const Item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {


  Item.find().then(function (foundItems) {


    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved default items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });

    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});


app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);


  const foundList = await List.findOne({ name: customListName });
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defaultItems
    });

    list.save();
    res.redirect("/" + customListName);
  }

  res.render("list", { listTitle: foundList.name, newListItems: foundList.items })

});



app.post("/", async (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({ name: listName }).then(foundList => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }


});












app.post("/delete", async (req, res) => { //< Note the use of async and arrow function
  try { //< Use a try/catch block for cleaner error handling
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;


    if (listName === "Today") {

      const deletedItem = await Item.findByIdAndDelete(checkedItemId); //< Note the use of await keyword
      console.log("Successfully deleted checked item:", deletedItem);
      if (deletedItem) res.redirect("/");
    }
    else {
      const foundList = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
      if (foundList)
        res.redirect("/" + listName);



    };

  }
  catch (err) {
    console.log('Error:', err);
    //Send error message to front-end
  }

});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
 
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ticket struct {
	Id          string `json:"id"`
	Description string `json:"desc"`
	Person      string `json:"person"`
}

var sample = []ticket{
	{Id: "1", Description: "company1-Issue:1", Person: "Ishwar"},
	{Id: "2", Description: "company1-Issue:2", Person: "Virendra"},
	//{id:"3", description:"company2-Issue:3", person:"Ishwar"},
}

func getTickets(t *gin.Context) {
	t.IndentedJSON(http.StatusOK, sample)
}

func sendHtml(c *gin.Context) {
	var name string = "checksheet.html"
	c.HTML(
		http.StatusOK,
		name,
		gin.H{
			"title":   "HomePage",
			"year":    "2023",
			"company": "Hexagon Manufacturing Intelligence",
		},
	)
}

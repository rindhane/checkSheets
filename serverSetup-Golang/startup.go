package main

import (
	"github.com/gin-gonic/gin"
)

func setRoutes(r *gin.Engine) {
	r.GET("/tickets", getTickets)
	r.GET("/checkSheet", sendHtml)
}

func main() {
	router := gin.Default()
	router.Static("/assets", "./assets")
	router.LoadHTMLGlob("templates/*")
	setRoutes(router)
	router.Run("localhost:9500")
}

//complete from
//https://go.dev/doc/tutorial/web-service-gin
//https://www.scaler.com/event/golang-crash-course/
//https://www.scaler.com/events
//https://www.youtube.com/watch?v=yyUHQIec83I&t=8s
//https://betterprogramming.pub/how-to-render-html-pages-with-gin-for-golang-9cb9c8d7e7b6

//other ref:
//https://faun.pub/dependency-injection-in-go-the-better-way-833e2cc65fab
//https://hoohoo.top/blog/20210530112304-golang-tutorial-introduction-gin-html-template-and-how-integration-with-bootstrap/

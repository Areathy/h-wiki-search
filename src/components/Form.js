import React, { Component } from "react";

const Failed = ({ title }) => {
   return (
      <div className="error-message">{title}</div>
   );
}


export default class Form extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         searchResults: [],
         wikiResults: "",
         loader: null,
         error: null
      }
   }

   wikiSEngine = (e) => {
      e.preventDefault();

      this.setState({
         searchResults: [],
         loader: true,
         error: null
      });

      const pointerToThis = this;

      var url = "https://en.wikipedia.org/w/api.php";

      var params = {
         action: "query",
         list: "search",
         srsearch: this.state.wikiResults,
         format: "json"
      };

      url = url + "?origin=*";
      Object.keys(params).forEach((key) => {
         url += "&" + key + "=" + params[key];
      });

      fetch(url)
         .then(
            function (response) {
               return response.json();
            }
         )
         .then(
            function (response) {
               if (!response.query || !response.query.search.length) {
                  return this.setState({ error: 'No result found', loader: null })
               }

               for (var key in response.query.search) {
                  pointerToThis.state.searchResults.push({
                     queryResultPageFullURL: "no link",
                     queryResultPageID: response.query.search[key].pageid,
                     queryResultPageTitle: response.query.search[key].title,
                     queryResultPageSnippet: response.query.search[key].snippet
                  });
               }
               pointerToThis.setState({ loader: null })
            }
         )
         .then(
            function (response) {
               for (var key2 in pointerToThis.state.searchResults) {
                  let page = pointerToThis.state.searchResults[key2];
                  let pageID = page.queryResultPageID;
                  let urlForRetrievingPageURLByPageID = `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=info&pageids=${pageID}&inprop=url&format=json`;

                  fetch(urlForRetrievingPageURLByPageID)
                     .then(
                        function (response) {
                           return response.json();
                        }
                     )
                     .then(
                        function (response) {
                           page.queryResultPageFullURL = response.query.pages[pageID].fullurl;

                           pointerToThis.forceUpdate();
                        }
                     )
               }
            }
         ).catch(e => {
            return this.setState({ error: 'No result found', loader: null })
         })
   }

   changewikiResults = (e) => {
      this.setState({
         wikiResults: e.target.value
      });
   }

   render() {
      let wikiSearchResults = [];

      for (var key3 in this.state.searchResults) {
         wikiSearchResults.push(
            <div className="searchResultDiv" key={key3}>
               <h3><a href={this.state.searchResults[key3].queryResultPageFullURL}>{this.state.searchResults[key3].queryResultPageTitle}</a></h3>
               <span className="link"><a href={this.state.searchResults[key3].queryResultPageFullURL}>{this.state.searchResults[key3].queryResultPageFullURL}</a></span>
               <p className="description" dangerouslySetInnerHTML={{ __html: this.state.searchResults[key3].queryResultPageSnippet }}></p>
            </div>
         );
      }

      console.log(wikiSearchResults);

      return (
         <div className="home">
            <h1>H-Wikipedia-Search</h1>
            <form action="">
               <input type="text" value={this.state.wikiResults || ""} onChange={this.changewikiResults} placeholder="Search for Articles" />
               <button type="submit" onClick={this.wikiSEngine}>Search</button>
            </form>
            {this.state.loader &&
               <div className="spiner">
                  <div className="spin"></div>
               </div>}
            {wikiSearchResults}
            <Failed title={this.state.error} />
         </div>
      );
   }
}


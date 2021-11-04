# Manga Scrapper API
An API to get URL to all manga series and every chapters’ images from Asura Scans Website

This project is published on these links below:
- version1: https://manga-website-scrapper.herokuapp.com/
- version2: https://manga-website-scrapper-v2.herokuapp.com/
- version3: https://api.manga.suputranike.site/ and https://manga-scrapper-v3.et.r.appspot.com/

<table>
  <caption><h3>Endpoints v3</h3></caption>
  <tr>
  	<th>Query</th>
    <th>Path</th>
    <th>Request Type</th>
  </tr>
  <tr>
    <td>Fetch all series data from the database</td>
    <td>/series</td>
    <td>GET</td>
  </tr>
  <tr>
    <td>Fetch a specific series data from the database</td>
    <td>/series/{slug}<br>e.g., /series/solo-leveling</td>
    <td>GET</td>
  </tr>
  <tr>
    <td>Fetch all chapter data of a specific series from the database</td>
    <td>/series/{slug}/chapters<br>e.g., /series/solo-leveling/chapters</td>
    <td>GET</td>
  </tr>
  <tr>
    <td>Scrape new chapter data for a specific series</td>
    <td>/series/{slug}/chapters<br>e.g., /series/solo-leveling/chapters</td>
    <td>PATCH</td>
  </tr>
  <tr>
    <td>Fetch a specific chapter data from the database</td>
    <td>/series/{slug}/chapter/{id}<br>e.g., /series/solo-leveling/chapter/170</td>
    <td>GET</td>
  </tr>
  <tr>
    <td>Scrape new image content for a specific chapter</td>
    <td>/series/{slug}/chapter/{id}<br>e.g., /series/solo-leveling/chapter/170</td>
    <td>PATCH</td>
  </tr>
</table>

<table>
  <caption><h3>GraphQL: /graphql</h3></caption>
  <tr>
  	<th>Query</th>
    <th>Request Type</th>
    <th>Content Type</th>
    <th>Body Example</th>
  </tr>
  <tr>
  	<td>Fetch all series data</td>
    <td>POST</td>
    <td>application/json</td>
    <td>{ "query": "{ series { seriesId seriesTitle seriesSlug coverImage synopsis selfUrl chaptersUrl sourceUrl } }" }</td>
  </tr>
<tr>
  	<td>Fetch a specific series data filtered by its slug</td>
    <td>POST</td>
    <td>application/json</td>
    <td>{ "query": "{ seriesBySlug(seriesSlug: \"solo-leveling\") { seriesId seriesTitle seriesSlug coverImage synopsis selfUrl chaptersUrl sourceUrl } }" }</td>
  </tr>
</table>
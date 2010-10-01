<?
  // include a file that defines a secret key
  // all this should contain is:
  // define("SECRET_KEY", "your secret key goes here") // (inside php tags of course)
  // this is used when caching the API requests and writing them to files - the filenames
  // are hashed with this secret key as a security measure.  an example is in secret_key.php.template
  require_once "secret_key.php";
  
  // a simple way to get around the same origin policy that prevents cross-domain Javascript
  // AJAX requests: build a quick and dirty PHP method of getting them and rendering them.
  // to keep our Javascript less verbose, we'll only ever ask for stuff after the API address
  if ($_GET['q']) {
    echo getAndCache($_GET['q']);
    exit;
  }
  
  function getAndCache($request) {
    $cached_file = sha1($request . SECRET_KEY);
    // if a cached request exists on disk and it is newer than 30 minutes, use it
    if (file_exists("cache/" . $cached_file) && fileAgeInMinutes("cache/" . $cached_file) < 30) {
      $response = file_get_contents("cache/" . $cached_file);
    } else {
      $response = file_get_contents("http://elections.raisethehammer.org/api" . $request);
      // write the response to the cache
      $handle = fopen("cache/" . $cached_file, "w");
      fwrite($handle, $response);
      fclose($handle);
    }
    return $response;
  }
  
  function fileAgeInMinutes($file) {
    return intVal((mktime() - filemtime($file)) / 60);
  }
  
?>
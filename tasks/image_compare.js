/*
 * grunt-image-compare
 * https://github.com/stimmins/grunt-image-compare
 *
 * Copyright (c) 2014 Scott
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function(grunt) {
  var Canvas = require('canvas');
  var imagediff = require('imagediff');
  var async = require('async');

  function getImage(source_image) {
    var image = new Canvas.Image();

    image.src = source_image;

    return imagediff.toImageData(image);
  }

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('image_compare', 'Compare 2 images and generate a difference if there is one.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      images: [],
      reportFile: 'compare-image.txt'
    });

    var done = this.async();

    async.eachSeries(options.images, function(item, callback) {
      var originalImage = getImage(item.original);
      var newImage = getImage(item.new);

      grunt.log.writeln('Analyzing: ' + item.original);
      if(imagediff.equal(originalImage, newImage, 0)) {
        grunt.log.writeln('No difference Found: ' + item.original + ' ' + item.new);
        return callback();
      }

      var result = imagediff.diff(originalImage, newImage);

      grunt.log.writeln('Difference Found: ' + item.original + ' ' + item.new);
      imagediff.imageDataToPNG(result, item.diff, function() {
        callback();
      });
    }, function(error) {
      if (error) {
        throw error;
      }
      done();
    });
  });
};

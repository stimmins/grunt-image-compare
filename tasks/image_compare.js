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

  function matchImageSize(source_image, width, height) {
      var canvas = new Canvas(width, height);
      var context = canvas.getContext('2d');

      context.globalCompositeOperation = "source-over";
      context.fillStyle = '#ffffff';

      context.fillRect(0, 0, width, height);
      context.drawImage(source_image, 0, 0);
    return imagediff.toImageData(canvas);
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
      var originalImage = new Canvas.Image();
      originalImage.src = item.original;

      var newImage = new Canvas.Image();
      newImage.src = item.new;

      var width = Math.max(originalImage.width, newImage.width);
      var height = Math.max(originalImage.height, newImage.height);

      originalImage = matchImageSize(originalImage, width, height);
      newImage = matchImageSize(newImage, width, height);

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

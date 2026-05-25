const express = require('express');
const OpenAI = require('openai');
const Thumbnail = require('../models/Thumbnail');
const isAuthenticated = require('../middleware/isAuthenticated');

const router = express.Router();
const styles = ['Minimalist', 'Bold', 'Cinematic', 'Gaming'];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Render the authenticated thumbnail generation page.
router.get('/generate', isAuthenticated, (req, res) => {
  res.render('generate', {
    imageUrl: null,
    promptText: '',
    selectedStyle: 'Minimalist',
    styles
  });
});

// Generate thumbnail on the server and save the result for the user.
router.post('/generate', isAuthenticated, async (req, res) => {
  const promptText = (req.body.promptText || '').trim();
  const style = req.body.style;
  const renderData = {
    imageUrl: null,
    promptText,
    selectedStyle: style,
    styles
  };

  if (!promptText || promptText.length > 500 || !styles.includes(style)) {
    req.flash('error', 'Please enter a prompt up to 500 characters and choose a valid style.');
    res.locals.errorMessages = req.flash('error');
    return res.status(400).render('generate', renderData);
  }

  try {
    const imagePrompt = `${style} style YouTube thumbnail: ${promptText}`;

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024'
    });

    const imageBase64 =
      response.data &&
      response.data[0] &&
      response.data[0].b64_json;

    if (!imageBase64) {
      throw new Error('OpenAI did not return image data.');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    await Thumbnail.create({
      userId: req.user._id,
      promptText,
      style,
      imageUrl
    });

    req.flash('success', 'Thumbnail generated and saved to your library.');
    res.locals.successMessages = req.flash('success');

    res.render('generate', {
      ...renderData,
      imageUrl
    });
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    req.flash('error', 'Could not generate a thumbnail. Check your OpenAI API key and try again.');
    res.locals.errorMessages = req.flash('error');
    res.status(500).render('generate', renderData);
  }
});

// Display all thumbnails owned by the current user.
router.get('/library', isAuthenticated, async (req, res) => {
  try {
    const showFavourites = req.query.filter === 'favourites';
    const query = { userId: req.user._id };
    if (showFavourites) query.isFavourite = true;

    const thumbnails = await Thumbnail.find(query).sort({ createdAt: -1 });
    res.render('library', { thumbnails, showFavourites });
  } catch (error) {
    console.error('Library load failed:', error);
    req.flash('error', 'Could not load your thumbnail library.');
    res.redirect('/generate');
  }
});

// Toggle favourite status for a thumbnail owned by the current user.
router.post('/library/:id/favourite', isAuthenticated, async (req, res) => {
  try {
    const thumbnail = await Thumbnail.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (thumbnail) {
      thumbnail.isFavourite = !thumbnail.isFavourite;
      await thumbnail.save();
    }
  } catch (error) {
    console.error('Favourite toggle failed:', error);
  }

  const referer = req.get('Referer') || '/library';
  res.redirect(referer);
});

// Delete only thumbnails that belong to the authenticated user.
router.delete('/library/:id', isAuthenticated, async (req, res) => {
  try {
    const deletedThumbnail = await Thumbnail.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (deletedThumbnail) {
      req.flash('success', 'Thumbnail deleted.');
    } else {
      req.flash('error', 'Thumbnail not found or you do not have permission to delete it.');
    }
  } catch (error) {
    console.error('Thumbnail delete failed:', error);
    req.flash('error', 'Could not delete that thumbnail.');
  }

  res.redirect('/library');
});

module.exports = router;

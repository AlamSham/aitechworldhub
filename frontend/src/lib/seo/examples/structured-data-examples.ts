/**
 * Structured Data Generator Examples
 * 
 * This file demonstrates how to use the structured data generators
 * for various content types on the AITechWorldHub blog.
 */

import {
  generateBlogPosting,
  generateArticle,
  generatePerson,
  generateBreadcrumb,
  generateWebSite,
  generateCollectionPage,
  generateFAQPage,
  generateHowTo,
  generateImageObject,
  generateOrganization,
  validateSchema,
  minifyJsonLd,
  type PublishedPost,
  type Author,
  type TopicHub,
} from '../structured-data';

// ============================================================================
// Example 1: Blog Post with BlogPosting Schema
// ============================================================================

export function exampleBlogPost() {
  const post: PublishedPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Understanding Neural Networks: A Comprehensive Guide',
    slug: 'understanding-neural-networks',
    excerpt: 'Learn the fundamentals of neural networks, from basic perceptrons to deep learning architectures.',
    content: 'Full article content here...',
    imageUrl: '/images/neural-networks-guide.jpg',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T15:30:00Z'),
    createdAt: new Date('2024-01-10T08:00:00Z'),
    author: {
      name: 'Dr. Sarah Johnson',
      slug: 'sarah-johnson',
      bio: 'AI researcher specializing in deep learning and neural networks',
      imageUrl: '/images/authors/sarah-johnson.jpg',
    },
    category: 'Machine Learning',
    tags: ['Neural Networks', 'Deep Learning', 'AI', 'Machine Learning'],
    focusKeyword: 'neural networks',
    wordCount: 2500,
  };

  // Generate BlogPosting schema
  const schema = generateBlogPosting(post);

  // Validate the schema
  const validation = validateSchema(schema);
  console.log('Schema valid:', validation.valid);
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);

  // Minify for production
  const minified = minifyJsonLd(schema);
  console.log('Minified JSON-LD:', minified);

  return schema;
}

// ============================================================================
// Example 2: Author Page with Person Schema
// ============================================================================

export function exampleAuthorPage() {
  const author: Author = {
    name: 'Dr. Sarah Johnson',
    slug: 'sarah-johnson',
    bio: 'AI researcher with 10+ years of experience in deep learning and neural networks. Published author and conference speaker.',
    imageUrl: '/images/authors/sarah-johnson.jpg',
    jobTitle: 'Senior AI Researcher',
    expertise: [
      'Deep Learning',
      'Neural Networks',
      'Computer Vision',
      'Natural Language Processing',
    ],
    socialLinks: {
      twitter: 'https://twitter.com/sarahjohnsonai',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson',
    },
  };

  const schema = generatePerson(author);
  return schema;
}

// ============================================================================
// Example 3: Topic Hub with CollectionPage Schema
// ============================================================================

export function exampleTopicHub() {
  const topicHub: TopicHub = {
    title: 'Machine Learning',
    slug: 'machine-learning',
    description: 'Explore the latest articles, tutorials, and insights on machine learning, from basic concepts to advanced techniques.',
    posts: [
      {
        title: 'Introduction to Machine Learning',
        slug: 'intro-to-machine-learning',
      },
      {
        title: 'Supervised vs Unsupervised Learning',
        slug: 'supervised-vs-unsupervised',
      },
      {
        title: 'Deep Learning Fundamentals',
        slug: 'deep-learning-fundamentals',
      },
    ],
  };

  const schema = generateCollectionPage(topicHub);
  return schema;
}

// ============================================================================
// Example 4: FAQ Section with FAQPage Schema
// ============================================================================

export function exampleFAQSection() {
  const faqs = [
    {
      question: 'What is artificial intelligence?',
      answer: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction.',
    },
    {
      question: 'What is the difference between AI and machine learning?',
      answer: 'AI is the broader concept of machines being able to carry out tasks in a smart way, while machine learning is a specific subset of AI that trains machines to learn from data without being explicitly programmed.',
    },
    {
      question: 'What are neural networks?',
      answer: 'Neural networks are computing systems inspired by biological neural networks in animal brains. They consist of interconnected nodes (neurons) that process information using a connectionist approach to computation.',
    },
    {
      question: 'What is deep learning?',
      answer: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers (deep neural networks) to progressively extract higher-level features from raw input.',
    },
  ];

  const schema = generateFAQPage(faqs);
  return schema;
}

// ============================================================================
// Example 5: How-To Guide with HowTo Schema
// ============================================================================

export function exampleHowToGuide() {
  const howToData = {
    name: 'How to Build Your First Neural Network',
    description: 'A step-by-step guide to building and training your first neural network using Python and TensorFlow.',
    steps: [
      {
        name: 'Install Required Libraries',
        text: 'Install Python, TensorFlow, and NumPy using pip: pip install tensorflow numpy matplotlib',
      },
      {
        name: 'Prepare Your Dataset',
        text: 'Load and preprocess your training data. Split into training and validation sets, normalize values, and convert labels to one-hot encoding.',
      },
      {
        name: 'Define the Neural Network Architecture',
        text: 'Create a Sequential model and add layers: input layer, hidden layers with activation functions, and output layer.',
      },
      {
        name: 'Compile the Model',
        text: 'Choose an optimizer (e.g., Adam), loss function (e.g., categorical crossentropy), and metrics (e.g., accuracy).',
      },
      {
        name: 'Train the Model',
        text: 'Fit the model to your training data using model.fit(), specifying epochs and batch size.',
      },
      {
        name: 'Evaluate and Test',
        text: 'Evaluate the model on your test set and analyze the results. Fine-tune hyperparameters as needed.',
      },
    ],
    totalTime: 'PT2H', // 2 hours
    tools: ['Python', 'TensorFlow', 'NumPy', 'Jupyter Notebook'],
    supplies: ['Training dataset', 'GPU (optional but recommended)'],
  };

  const schema = generateHowTo(howToData);
  return schema;
}

// ============================================================================
// Example 6: Homepage with WebSite Schema
// ============================================================================

export function exampleHomepage() {
  const schema = generateWebSite();
  return schema;
}

// ============================================================================
// Example 7: Breadcrumb Navigation
// ============================================================================

export function exampleBreadcrumbs() {
  // Example for a blog post page
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Machine Learning', path: '/topics/machine-learning' },
    { name: 'Understanding Neural Networks', path: '/posts/understanding-neural-networks' },
  ];

  const schema = generateBreadcrumb(breadcrumbItems);
  return schema;
}

// ============================================================================
// Example 8: Image with ImageObject Schema
// ============================================================================

export function exampleImage() {
  const imageData = {
    url: '/images/neural-networks-diagram.jpg',
    caption: 'Diagram showing the architecture of a multi-layer neural network',
    width: 1200,
    height: 800,
    format: 'image/jpeg',
  };

  const schema = generateImageObject(imageData);
  return schema;
}

// ============================================================================
// Example 9: Organization Schema (Publisher Info)
// ============================================================================

export function exampleOrganization() {
  const schema = generateOrganization();
  return schema;
}

// ============================================================================
// Example 10: Complete Page with Multiple Schemas
// ============================================================================

export function exampleCompletePage() {
  // A typical blog post page would include multiple schemas
  const post: PublishedPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Understanding Neural Networks: A Comprehensive Guide',
    slug: 'understanding-neural-networks',
    excerpt: 'Learn the fundamentals of neural networks.',
    content: 'Full content...',
    imageUrl: '/images/neural-networks-guide.jpg',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    author: {
      name: 'Dr. Sarah Johnson',
      slug: 'sarah-johnson',
      bio: 'AI researcher',
    },
    category: 'Machine Learning',
    tags: ['Neural Networks', 'Deep Learning'],
    wordCount: 2500,
  };

  // Generate all schemas for the page
  const schemas = {
    blogPosting: generateBlogPosting(post),
    breadcrumb: generateBreadcrumb([
      { name: 'Home', path: '/' },
      { name: 'Machine Learning', path: '/topics/machine-learning' },
      { name: post.title, path: `/posts/${post.slug}` },
    ]),
    organization: generateOrganization(),
  };

  // Validate all schemas
  Object.entries(schemas).forEach(([type, schema]) => {
    const validation = validateSchema(schema);
    console.log(`${type} validation:`, validation.valid);
    if (!validation.valid) {
      console.error(`${type} errors:`, validation.errors);
    }
  });

  return schemas;
}

// ============================================================================
// Usage in Next.js Page Component
// ============================================================================

/**
 * Example of how to use structured data in a Next.js page component
 * 
 * ```tsx
 * import { generateBlogPosting, minifyJsonLd } from '@/lib/seo';
 * 
 * export default function BlogPostPage({ post }) {
 *   const schema = generateBlogPosting(post);
 *   const jsonLd = minifyJsonLd(schema);
 *   
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{ __html: jsonLd }}
 *       />
 *       <article>
 *         <h1>{post.title}</h1>
 *         <p>{post.excerpt}</p>
 *         {/* Rest of the content *\/}
 *       </article>
 *     </>
 *   );
 * }
 * ```
 */

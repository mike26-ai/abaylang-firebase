// File: src/config/products.ts

/**
 * =================================================================================
 * SERVER-SIDE PRODUCT CATALOG
 * =================================================================================
 * This file is the single source of truth for all sellable products in the application.
 * All details like price, duration, and Paddle Price IDs are defined here.
 * The booking API uses this catalog to get authoritative data, preventing any
 * client-side tampering or data inconsistencies.
 *
 * NOTE: The `key` of each product (e.g., 'comprehensive-lesson') is the `productId`
 * that the client will send to the server.
 * =================================================================================
 */
import { paddlePriceIds } from './paddle';

export const products = {
  // --- INDIVIDUAL LESSONS ---
  'free-trial': {
    label: 'Free Trial',
    type: 'individual',
    duration: 30, // minutes
    price: 0,
    paddlePriceId: paddlePriceIds.freeTrial,
    description: 'One-time only trial to meet the tutor',
    features: ['Meet the tutor', 'Experience teaching style', 'Discuss learning goals'],
  },
  'quick-practice': {
    label: 'Quick Practice',
    type: 'individual',
    duration: 30,
    price: 9,
    paddlePriceId: paddlePriceIds.quickPractice,
    description: 'Perfect for conversation practice',
    features: ['Conversation practice', 'Pronunciation correction', 'Quick grammar review'],
  },
  'comprehensive-lesson': {
    label: 'Comprehensive Lesson',
    type: 'individual',
    duration: 60,
    price: 16,
    paddlePriceId: paddlePriceIds.comprehensiveLesson,
    description: 'Structured learning session',
    features: ['Structured lesson plan', 'Cultural context & stories', 'Homework & materials'],
  },

  // --- GROUP SESSIONS ---
  'quick-group-conversation': {
    label: 'Quick Group Conversation',
    type: 'group',
    duration: 30,
    price: 7,
    paddlePriceId: paddlePriceIds.quickGroupConversation,
    description: 'Practice with fellow learners',
    features: ['Small group setting (4-6)', 'Focused conversation', 'Peer learning experience'],
  },
  'immersive-conversation-practice': {
    label: 'Immersive Conversation Practice',
    type: 'group',
    duration: 60,
    price: 12,
    paddlePriceId: paddlePriceIds.immersiveConversationPractice,
    description: 'Deeper conversation and cultural insights',
    features: ['Extended conversation time', 'In-depth cultural topics', 'Collaborative learning'],
  },

  // --- PRIVATE GROUP LESSON ---
  'private-group-lesson': {
    label: 'Private Group Lesson',
    type: 'private-group',
    duration: 60,
    price: 10, // Per person
    paddlePriceId: 'TBD', // Needs a dynamic pricing solution or manual checkout
    description: 'Book a private session for your own group',
    features: ["Your own private group", "Flexible for families or friends", "Personalized to your group's level"],
  },

  // --- PACKAGES ---
  'quick-practice-bundle': {
    label: 'Quick Practice Bundle',
    type: 'package',
    duration: '10 x 30-min',
    price: 50,
    originalPrice: 70,
    totalLessons: 10,
    paddlePriceId: paddlePriceIds.quickPracticeBundle,
    description: '10 conversation practice sessions',
    features: ['10 lessons, 30 mins each', 'Just $5 per lesson', 'Focus on speaking fluency', 'Flexible scheduling'],
  },
  'learning-intensive': {
    label: 'Learning Intensive',
    type: 'package',
    duration: '10 x 60-min',
    price: 100,
    originalPrice: 150,
    totalLessons: 10,
    paddlePriceId: paddlePriceIds.learningIntensive,
    description: 'Accelerate your structured learning',
    features: ['10 lessons, 60 mins each', 'Just $10 per lesson', 'Comprehensive curriculum', 'Priority booking'],
  },
  'starter-bundle': {
    label: 'Starter Bundle',
    type: 'package',
    duration: '5 x 30-min',
    price: 25,
    originalPrice: 35,
    totalLessons: 5,
    paddlePriceId: paddlePriceIds.starterBundle,
    description: 'Start practicing conversation regularly',
    features: ['5 lessons, 30 mins each', 'Great value to get started', 'Build conversational confidence'],
  },
  'foundation-pack': {
    label: 'Foundation Pack',
    type: 'package',
    duration: '5 x 60-min',
    price: 60,
    originalPrice: 75,
    totalLessons: 5,
    paddlePriceId: paddlePriceIds.foundationPack,
    description: 'Build a solid foundation',
    features: ['5 lessons, 60 mins each', 'Perfect for beginners', 'Covers core concepts'],
  },
} as const;

// This provides a TypeScript type for a valid product ID key.
export type ProductId = keyof typeof products;

// A helper function to check if a string is a valid ProductId
export function isValidProductId(id: string): id is ProductId {
  return id in products;
}

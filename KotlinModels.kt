package com.example.agenda.model

import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

/**
 * Niveles de prioridad disponibles para clases y tareas.
 */
enum class PriorityLevel(val value: String) {
    BAJA("baja"),
    MEDIA("media"),
    ALTA("alta")
}

/**
 * Modelo de datos Kotlin para Clases del curso en Firestore.
 */
data class CourseClass(
    val id: String = "",
    val ownerId: String = "",
    val title: String = "",
    val topic: String = "",
    val date: String = "",
    val startTime: String = "",
    val durationMinutes: Int = 60,
    val instructor: String = "",
    val location: String = "",
    val priority: String = "media",
    @ServerTimestamp val createdAt: Date? = null,
    @ServerTimestamp val updatedAt: Date? = null
)

/**
 * Modelo de datos Kotlin para Tareas y entregas en Firestore.
 */
data class CourseTask(
    val id: String = "",
    val ownerId: String = "",
    val title: String = "",
    val description: String = "",
    val dueDate: String = "",
    val topic: String = "",
    val completed: Boolean = false,
    val priority: String = "media",
    @ServerTimestamp val createdAt: Date? = null,
    @ServerTimestamp val updatedAt: Date? = null
)

import { useState } from 'react'

export default function ReorderableGrid({
  items,
  admin,
  renderItem,
  onReorder,
  containerClass = 'card-grid',
  itemClass = 'card',
}) {
  const [dragIndex, setDragIndex] = useState(null)

  const handleDragStart = (index) => {
    setDragIndex(index)
  }

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      return
    }

    const reordered = [...items]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    const normalized = reordered.map((item, order) => ({
      ...item,
      sortOrder: order + 1,
    }))

    onReorder(normalized)
    setDragIndex(null)
  }

  return (
    <div className={containerClass}>
      {items.map((item, index) => (
        <article
          key={item.id}
          draggable={admin}
          className={`${itemClass} ${admin ? 'admin-draggable' : ''}`.trim()}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(index)}
          aria-grabbed={admin ? dragIndex === index : undefined}
        >
          {renderItem(item, index)}
          {admin && (
            <span className="drag-hint" aria-hidden="true">
              Drag
            </span>
          )}
        </article>
      ))}
    </div>
  )
}

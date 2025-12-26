from sqlmodel import Session, select
from models.semester import Semester


def sync_semesters(session: Session, program_id: int, total_semesters: int):

    existing = session.exec(
        select(Semester.semester_number).where(Semester.program_id == program_id)
    ).all()

    existing_set = set(existing)

    for i in range(1, total_semesters + 1):
        if i not in existing_set:
            session.add(Semester(program_id=program_id, semester_number=i))

    extra_semesters = session.exec(
        select(Semester).where(
            Semester.program_id == program_id,
            Semester.semester_number > total_semesters,
        )
    ).all()

    for semester in extra_semesters:
        session.delete(semester)

    session.commit()

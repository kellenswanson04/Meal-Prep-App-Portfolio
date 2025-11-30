# unit_conversion.py
import zmq
import json

def convert_time(value, from_unit, to_unit):
    # Convert everything to seconds first
    multipliers = {
        "seconds": 1,
        "minutes": 60,
        "hours": 3600,
        "days": 86400
    }

    if from_unit not in multipliers or to_unit not in multipliers:
        return {"success": False, "error": "Invalid unit"}

    # Convert the input to seconds
    seconds_value = value * multipliers[from_unit]

    # Convert seconds to target unit
    result = seconds_value / multipliers[to_unit]

    return {
        "success": True,
        "from": f"{value} {from_unit}",
        "to": f"{result} {to_unit}",
        "value": result
    }


def main():
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5558")  # New port for this service

    print("Time Conversion Microservice running on port 5558")

    while True:
        message = socket.recv_string()

        parts = message.split()
        if len(parts) != 3:
            socket.send_json({"success": False, "error": "Format: value from_unit to_unit"})
            continue

        value = float(parts[0])
        from_unit = parts[1].lower()
        to_unit = parts[2].lower()

        response = convert_time(value, from_unit, to_unit)
        socket.send_json(response)


if __name__ == "__main__":
    main()
